"""
build_variation_groups.py

Reads all Shopify products, groups them into product families
(same YMM + category, different style/config), extracts fitment attributes
from product tags and titles, and writes to Supabase.

Run: python scripts/build_variation_groups.py
Re-run freely — uses upsert, safe to run multiple times.

Requires environment variables:
  SHOPIFY_STORE_URL
  SHOPIFY_ACCESS_TOKEN
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import time
import json
from collections import defaultdict

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import requests

SHOPIFY_URL = (os.getenv("SHOPIFY_STORE_URL") or os.getenv("SHOPIFY_SHOP_URL", "")).rstrip("/")
SHOPIFY_TOKEN = os.getenv("SHOPIFY_ACCESS_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

SHOPIFY_HEADERS = {
    "X-Shopify-Access-Token": SHOPIFY_TOKEN,
    "Content-Type": "application/json",
}

SUPABASE_HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}

STYLE_PATTERNS = [
    (r"\bmesh\b", "Mesh"),
    (r"\bbillet\b", "Billet"),
    (r"\boe[\s\-]?style\b", "OE Style"),
    (r"\bblack out\b|\bblackout\b", "Blackout"),
    (r"\braptor[\s\-]?style\b", "Raptor Style"),
    (r"\bcarbon\b", "Carbon Fiber"),
    (r"\bchrome\b", "Chrome"),
    (r"\bmatte black\b", "Matte Black"),
    (r"\bgloss black\b|\bpiano black\b", "Gloss Black"),
    (r"\bsmoke[d]?\b", "Smoked"),
    (r"\bclear\b", "Clear"),
    (r"\btinted\b", "Tinted"),
    (r"\bsatin\b", "Satin"),
    (r"\bstainless\b", "Stainless"),
    (r"\bpowder coat\b", "Powder Coat"),
    (r"\btextured\b", "Textured"),
    (r"\bpolished\b", "Polished"),
    (r"\bheavy duty\b|\bhd\b", "Heavy Duty"),
    (r"\bstep\b", "Step Style"),
    (r"\boverland\b", "Overland"),
]

BED_PATTERNS = [
    (r"5[''\.]\s?5|5\.5[\s\-]?ft|65[\s\-]?inch|65\"", "5.5 ft"),
    (r"6[''\.]\s?5|6\.5[\s\-]?ft|78[\s\-]?inch|78\"", "6.5 ft"),
    (r"\b8[\s\-]?ft\b|96[\s\-]?inch|96\"|\blong bed\b", "8 ft"),
    (r"5[''\.]\s?0|5\.0[\s\-]?ft|60[\s\-]?inch|60\"|\bshort bed\b", "5 ft"),
    (r"\bfleetside\b", "Fleetside"),
    (r"\bstepside\b", "Stepside"),
]

TRIM_PATTERNS = [
    r"\braptor\b", r"\blariat\b", r"\bking ranch\b", r"\bplatinum\b",
    r"\blimited\b", r"\bxlt\b", r"\bxl\b", r"\bfx4\b", r"\bstx\b",
    r"\blaramie\b", r"\brebel\b", r"\blonghorn\b", r"\bpower wagon\b",
    r"\blt\b", r"\bltz\b", r"\bz71\b", r"\bhigh country\b", r"\bwt\b",
    r"\bsrw\b", r"\bdrw\b", r"\bdenali\b", r"\bat4\b", r"\belevation\b",
    r"\bsr5\b", r"\btrd\b", r"\bpro[\s\-]?4x\b", r"\bnismo\b",
    r"\bpro\b",
]

GROUPABLE_CATEGORIES = [
    "Grilles", "Bumpers", "Tonneau Covers", "Running Boards", "Step Bars",
    "Nerf Bars", "Fender Flares", "Bed Mats", "Bed Liners", "Bug Deflectors",
    "Window Deflectors", "Hood Deflectors", "Headlights", "Tail Lights",
    "Fog Lights", "Light Bars", "Hitches", "Mud Flaps", "Body Kits",
    "Side Steps", "Exterior", "Lighting",
]


def fetch_all_products():
    products = []
    url = f"{SHOPIFY_URL}/admin/api/2024-01/products.json?limit=250&fields=id,handle,title,tags,product_type,images,variants"
    while url:
        resp = requests.get(url, headers=SHOPIFY_HEADERS)
        resp.raise_for_status()
        data = resp.json()
        products.extend(data.get("products", []))
        link_header = resp.headers.get("Link", "")
        next_url = None
        for part in link_header.split(","):
            if 'rel="next"' in part:
                next_url = part.strip().split(";")[0].strip("<>")
        url = next_url
        if url:
            time.sleep(0.6)
        print(f"  Fetched {len(products)} products so far...")
    return products


def extract_style(text):
    text_lower = text.lower()
    for pattern, label in STYLE_PATTERNS:
        if re.search(pattern, text_lower):
            return label
    return None


def extract_bed_length(text):
    text_lower = text.lower()
    for pattern, label in BED_PATTERNS:
        if re.search(pattern, text_lower):
            return label
    return None


def extract_cab_type(text):
    text_lower = text.lower()
    if re.search(r"\bsupercrew\b|\bcrew cab\b", text_lower):
        return "Crew Cab"
    if re.search(r"\bsupercab\b|\bextended cab\b", text_lower):
        return "Extended Cab"
    if re.search(r"\bregular cab\b|\bstandard cab\b|\bsingle cab\b", text_lower):
        return "Regular Cab"
    if re.search(r"\bdouble cab\b", text_lower):
        return "Double Cab"
    if re.search(r"\baccess cab\b", text_lower):
        return "Access Cab"
    if re.search(r"\bclub cab\b", text_lower):
        return "Club Cab"
    return None


def extract_trims(tags_list):
    trims = []
    for tag in tags_list:
        tag_lower = tag.lower().strip()
        for pattern in TRIM_PATTERNS:
            if re.search(pattern, tag_lower):
                normalized = tag.strip().title()
                if normalized not in trims:
                    trims.append(normalized)
    return trims


def extract_ymm_tags(tags_list):
    ymm_tags = []
    ymm_pattern = re.compile(
        r"^(\d{4}(?:\s*[-\u2013]\s*\d{4})?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(.+)$"
    )
    for tag in tags_list:
        m = ymm_pattern.match(tag.strip())
        if m:
            ymm_tags.append((m.group(1), m.group(2), m.group(3)))
    return ymm_tags


def get_category_from_product(product):
    product_type = (product.get("product_type") or "").strip()
    title = product.get("title", "")
    if product_type:
        for cat in GROUPABLE_CATEGORIES:
            if cat.lower() in product_type.lower():
                return cat
    for cat in GROUPABLE_CATEGORIES:
        if cat.lower() in title.lower():
            return cat
    return product_type or "Other"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def build_group_key(year, make, model, category):
    return f"{slugify(year)}-{slugify(make)}-{slugify(model)}-{slugify(category)}"


def process_products(products):
    family_map = defaultdict(list)
    for product in products:
        tags = [t.strip() for t in product.get("tags", "").split(",") if t.strip()]
        ymm_list = extract_ymm_tags(tags)
        if not ymm_list:
            continue
        category = get_category_from_product(product)
        title = product.get("title", "")
        combined_text = title + " " + " ".join(tags)
        style = extract_style(combined_text)
        bed_length = extract_bed_length(combined_text)
        cab_type = extract_cab_type(combined_text)
        trims = extract_trims(tags)
        images = product.get("images", [])
        image_url = images[0]["src"] if images else None
        variants = product.get("variants", [])
        price = float(variants[0]["price"]) if variants else None
        is_in_stock = True
        if variants:
            v = variants[0]
            if v.get("inventory_management") == "shopify":
                is_in_stock = (v.get("inventory_quantity", 0) > 0 or
                               v.get("inventory_policy") == "continue")
        for (year, make, model) in ymm_list:
            group_key = build_group_key(year, make, model, category)
            family_map[group_key].append({
                "shopify_product_id": str(product["id"]),
                "shopify_product_gid": f"gid://shopify/Product/{product['id']}",
                "product_handle": product.get("handle", ""),
                "product_title": title,
                "price": price,
                "image_url": image_url,
                "option_label": style,
                "bed_length": bed_length,
                "cab_type": cab_type,
                "trim_level": trims[0] if trims else None,
                "category": category,
                "ymm_base": f"{year} {make} {model}",
                "group_key": group_key,
                "available_for_sale": is_in_stock,
            })

    multi = {k: v for k, v in family_map.items() if len(v) >= 2}
    print(f"\nFound {len(multi)} product families with 2+ members")
    print(f"(Single-product groups: {len(family_map) - len(multi)} — skipped)")
    return multi


def upsert_to_supabase(family_map):
    groups_upserted = 0
    members_upserted = 0

    for group_key, members in family_map.items():
        first = members[0]

        # Determine option_name from variation dimension
        styles = set(m["option_label"] for m in members if m["option_label"])
        beds = set(m["bed_length"] for m in members if m["bed_length"])
        if len(styles) > 1:
            option_name = "Style"
        elif len(beds) > 1:
            option_name = "Bed Length"
        else:
            option_name = "Option"

        group_payload = {
            "family_name": group_key,
            "category": first["category"],
            "ymm_base": first["ymm_base"],
            "option_name": option_name,
            "member_count": len(members),
        }

        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/product_variation_groups",
            headers=SUPABASE_HEADERS,
            json=group_payload,
        )

        if resp.status_code not in (200, 201):
            print(f"  ERROR upserting group {group_key}: {resp.status_code} {resp.text}")
            continue

        group_id = resp.json()[0]["id"]
        groups_upserted += 1

        for i, member in enumerate(members):
            member_payload = {
                "group_id": group_id,
                "shopify_product_id": member["shopify_product_id"],
                "shopify_product_gid": member["shopify_product_gid"],
                "product_handle": member["product_handle"],
                "product_title": member["product_title"],
                "price": member["price"],
                "image_url": member["image_url"],
                "option_label": member["option_label"],
                "bed_length": member["bed_length"],
                "cab_type": member["cab_type"],
                "trim_level": member["trim_level"],
                "available_for_sale": member["available_for_sale"],
                "display_order": i,
                "fitment_scope": "exact",
            }

            resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/product_variation_members",
                headers={**SUPABASE_HEADERS, "Prefer": "resolution=merge-duplicates"},
                json=member_payload,
            )

            if resp.status_code not in (200, 201):
                print(f"  ERROR upserting member {member['product_handle']}: {resp.status_code} {resp.text}")
            else:
                members_upserted += 1

    return groups_upserted, members_upserted


def print_sample_families(family_map, n=5):
    print(f"\n--- SAMPLE FAMILIES (first {n}) ---")
    for i, (group_key, members) in enumerate(list(family_map.items())[:n]):
        print(f"\nFamily: {group_key} ({len(members)} products)")
        for m in members:
            style = m["option_label"] or "no style"
            bed = m["bed_length"] or ""
            cab = m["cab_type"] or ""
            trim = m["trim_level"] or "all trims"
            print(f"  - {m['product_title'][:60]}")
            print(f"    style={style} | bed={bed} | cab={cab} | trim={trim}")


def main():
    print("=== Stehlen Auto: Build Variation Groups ===\n")
    
    if not SHOPIFY_URL or not SHOPIFY_TOKEN:
        print("ERROR: SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set")
        return
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return

    print("Step 1: Fetching all products from Shopify...")
    products = fetch_all_products()
    print(f"Fetched {len(products)} total products\n")

    print("Step 2: Grouping into product families...")
    family_map = process_products(products)

    print_sample_families(family_map)

    print(f"\nStep 3: Writing {len(family_map)} families to Supabase...")
    groups_count, members_count = upsert_to_supabase(family_map)

    print(f"\nDone.")
    print(f"  Groups upserted: {groups_count}")
    print(f"  Members upserted: {members_count}")
    print(f"\nRe-run this script any time products are added or changed.")


if __name__ == "__main__":
    main()

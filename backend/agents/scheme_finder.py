"""
Scheme Finder Agent
===================
Matches a citizen's profile to eligible government welfare schemes.
1. Searches MyScheme.gov.in API using individual split keyword queries.
2. Implements a robust fallback search engine matching official Government of India
   welfare schemes from myscheme.gov.in when external API returns zero hits.

Real data source: myscheme.gov.in official schemes catalog & endpoints.
"""

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

MYSCHEME_API = "https://api.myscheme.gov.in/search/v4/schemes"
MYSCHEME_HEADERS = {
    "User-Agent": "CivicPulseAI/1.0 (https://github.com/NITroFORGE/CivicPulse; civicpulse-schemes@gov.in)",
    "Accept": "application/json",
}

# ── Schemas ──────────────────────────────────────────────────────────────────
class CitizenProfile(BaseModel):
    age: int
    gender: str                  # male / female / other
    state: str                   # e.g., "Uttar Pradesh"
    category: str                # general / obc / sc / st / ews
    annual_income: int           # in INR
    occupation: str              # student / farmer / self-employed / unemployed / salaried / other
    education: str = "10th"      # none / 10th / 12th / graduate / postgraduate
    disability: bool = False
    bpl: bool = False            # Below Poverty Line


class Scheme(BaseModel):
    name: str
    ministry: str
    description: str
    benefit: str
    eligibility: str
    url: str
    official_portal_url: str | None = None
    myscheme_url: str | None = None
    is_verified: bool = True


class SchemeResponse(BaseModel):
    total_found: int
    schemes: list[Scheme]
    profile_summary: str


# ── Official Government Welfare Schemes Catalog (Fallback Engine) ───────────
OFFICIAL_SCHEMES_CATALOG = [
    {
        "name": "PM-USP: Central Sector Scheme of Scholarship for College and University Students",
        "ministry": "Ministry of Education",
        "description": "Financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.",
        "benefit": "₹12,000 to ₹20,000 per annum credited directly via DBT",
        "eligibility": "Students above 80th percentile in Class 12, family income under ₹4,50,000/year",
        "url": "https://scholarships.gov.in/",
        "official_portal_url": "https://scholarships.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/csss-cus",
        "is_verified": True,
        "target_occupations": ["student"],
        "max_income": 450000,
        "gender": ["male", "female", "other"],
        "min_age": 17,
        "max_age": 28,
        "keywords": ["scholarship", "education", "student", "college"],
    },
    {
        "name": "Post-Matric Scholarship Scheme for SC / ST / OBC Students",
        "ministry": "Ministry of Social Justice and Empowerment",
        "description": "Complete tuition fee waiver and maintenance allowance for students from marginalized communities enrolled in post-matriculation courses.",
        "benefit": "100% course tuition fees reimbursed + monthly maintenance allowance",
        "eligibility": "SC, ST, or OBC students enrolled in post-matric courses with family income under ₹2,50,000/year",
        "url": "https://scholarships.gov.in/",
        "official_portal_url": "https://scholarships.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pmsfss",
        "is_verified": True,
        "target_occupations": ["student"],
        "categories": ["sc", "st", "obc"],
        "max_income": 250000,
        "gender": ["male", "female", "other"],
        "keywords": ["scholarship", "sc", "st", "obc", "post-matric"],
    },
    {
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "description": "Direct income support to landholding farmer families to procure agricultural inputs and manage domestic needs.",
        "benefit": "₹6,000 per year paid in three equal 4-monthly installments of ₹2,000",
        "eligibility": "All landholding farmer families across rural and semi-urban India",
        "url": "https://pmkisan.gov.in/",
        "official_portal_url": "https://pmkisan.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pm-kisan",
        "is_verified": True,
        "target_occupations": ["farmer"],
        "gender": ["male", "female", "other"],
        "min_age": 18,
        "max_age": 99,
        "keywords": ["farmer", "agriculture", "kisan", "crop", "subsidy"],
    },
    {
        "name": "Kisan Credit Card (KCC) Scheme",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "description": "Timely access to affordable credit for farmers to meet agriculture cultivation expenses, post-harvest costs, and maintenance of farm assets.",
        "benefit": "Concessional institutional credit up to ₹3,00,000 at subsidized interest rate of 4% per annum",
        "eligibility": "Individual/joint farmers, tenant farmers, and sharecroppers",
        "url": "https://pmkisan.gov.in/",
        "official_portal_url": "https://pmkisan.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/search?q=Kisan+Credit+Card",
        "is_verified": True,
        "target_occupations": ["farmer"],
        "gender": ["male", "female", "other"],
        "min_age": 18,
        "max_age": 75,
        "keywords": ["farmer", "credit", "kcc", "loan", "agriculture"],
    },
    {
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "ministry": "Ministry of Health and Family Welfare",
        "description": "World's largest government-funded health assurance scheme providing secondary and tertiary hospitalization cover.",
        "benefit": "Cashless hospitalization coverage of up to ₹5,00,000 per family per year",
        "eligibility": "BPL, rural households identified by SECC 2011, low-income families, or annual income under ₹3,00,000",
        "url": "https://nha.gov.in/PM-JAY",
        "official_portal_url": "https://nha.gov.in/PM-JAY",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/ab-pmjay",
        "is_verified": True,
        "max_income": 300000,
        "bpl_only": False,
        "gender": ["male", "female", "other"],
        "keywords": ["health", "hospital", "bpl", "ayushman", "medical"],
    },
    {
        "name": "Pradhan Mantri Awas Yojana (PMAY - Urban & Gramin)",
        "ministry": "Ministry of Housing and Urban Affairs",
        "description": "Pucca housing with basic amenities for homeless and families living in kutcha or dilapidated houses.",
        "benefit": "Direct financial subsidy of up to ₹1,20,000 (rural) or interest subsidy up to ₹2,67,000 (urban)",
        "eligibility": "EWS/LIG families, BPL households, or families with annual income under ₹3,00,000 without a pucca house",
        "url": "https://pmaymis.gov.in/",
        "official_portal_url": "https://pmaymis.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pmay-g",
        "is_verified": True,
        "max_income": 300000,
        "gender": ["male", "female", "other"],
        "keywords": ["housing", "house", "bpl", "shelter", "pmay"],
    },
    {
        "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
        "ministry": "Ministry of Housing and Urban Affairs",
        "description": "Micro-credit facility for street vendors and micro-entrepreneurs to restart business after economic disruption.",
        "benefit": "Working capital collateral-free loan of ₹10,000 up to ₹50,000 with 7% interest subsidy",
        "eligibility": "Urban street vendors, self-employed hawkers, and informal micro-business owners",
        "url": "https://pmsvanidhi.mohua.gov.in/",
        "official_portal_url": "https://pmsvanidhi.mohua.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pm-svanidhi",
        "is_verified": True,
        "target_occupations": ["self-employed", "unemployed", "other"],
        "gender": ["male", "female", "other"],
        "min_age": 18,
        "max_age": 65,
        "keywords": ["vendor", "self-employed", "micro-loan", "business"],
    },
    {
        "name": "Pradhan Mantri Mudra Yojana (PMMY)",
        "ministry": "Ministry of Finance",
        "description": "Funding the unfunded: provides institutional micro-finance to non-corporate, non-farm small and micro enterprises.",
        "benefit": "Collateral-free loans up to ₹10,00,000 across Shishu, Kishore, and Tarun categories",
        "eligibility": "Self-employed individuals, artisans, small shopkeepers, and micro-entrepreneurs",
        "url": "https://www.mudra.org.in/",
        "official_portal_url": "https://www.mudra.org.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pmmy",
        "is_verified": True,
        "target_occupations": ["self-employed", "farmer", "other"],
        "gender": ["male", "female", "other"],
        "min_age": 18,
        "max_age": 65,
        "keywords": ["mudra", "loan", "self-employed", "startup", "entrepreneur"],
    },
    {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "ministry": "Ministry of Finance",
        "description": "Dedicated small-savings initiative under Beti Bachao Beti Padhao aimed at securing education and marriage expenses for girls.",
        "benefit": "High guaranteed interest rate (8.2% p.a.) with complete Section 80C tax exemption (EEE status)",
        "eligibility": "Girl child up to 10 years of age, or female citizens planning for higher studies",
        "url": "https://www.indiapost.gov.in/",
        "official_portal_url": "https://www.indiapost.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/search?q=Sukanya+Samriddhi",
        "is_verified": True,
        "gender": ["female"],
        "keywords": ["women", "girl", "savings", "female", "sukanya"],
    },
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "ministry": "Ministry of Women and Child Development",
        "description": "Maternity benefit cash incentive scheme providing partial wage compensation during pregnancy and lactation.",
        "benefit": "Cash incentive of ₹5,000 in two installments directly into beneficiary bank account",
        "eligibility": "Pregnant women and lactating mothers for first and second living child",
        "url": "https://pmmvy.wcd.gov.in/",
        "official_portal_url": "https://pmmvy.wcd.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pmmvy",
        "is_verified": True,
        "gender": ["female"],
        "min_age": 19,
        "max_age": 45,
        "keywords": ["women", "maternity", "mother", "female"],
    },
    {
        "name": "Scholarship Scheme for Students with Disabilities (Divyangjan)",
        "ministry": "Ministry of Social Justice and Empowerment",
        "description": "Empowering students with benchmark disabilities (40% or more) to pursue school and higher education through grants.",
        "benefit": "Pre-matric and Post-matric monthly stipends, book grants, and disability assistance allowance",
        "eligibility": "Students with 40%+ benchmark disability with family income under ₹2,50,000/year",
        "url": "https://scholarships.gov.in/",
        "official_portal_url": "https://scholarships.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pre-dis",
        "is_verified": True,
        "disability_required": True,
        "gender": ["male", "female", "other"],
        "keywords": ["disability", "divyang", "scholarship", "special needs"],
    },
    {
        "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
        "ministry": "Ministry of Skill Development and Entrepreneurship",
        "description": "Flagship skill certification scheme to enable Indian youth to take up industry-relevant skill training.",
        "benefit": "Free skill training, government-recognized skill certificate, and post-placement assistance",
        "eligibility": "Indian youth aged 15-45 looking for employment or upskilling",
        "url": "https://www.msde.gov.in/",
        "official_portal_url": "https://www.msde.gov.in/",
        "myscheme_url": "https://www.myscheme.gov.in/schemes/pmkvy-stt",
        "is_verified": True,
        "target_occupations": ["student", "unemployed", "other"],
        "gender": ["male", "female", "other"],
        "min_age": 15,
        "max_age": 45,
        "keywords": ["skill", "training", "unemployed", "youth", "placement"],
    },
]


# ── Helpers ──────────────────────────────────────────────────────────────────
def build_individual_queries(profile: CitizenProfile) -> list[str]:
    """
    Split combined profile traits into separate individual search queries.
    Prevents over-constrained searches that return 0 results.
    """
    queries = []

    # 1. Occupation-specific primary queries
    if profile.occupation == "student":
        queries.extend(["scholarship", "higher education"])
    elif profile.occupation == "farmer":
        queries.extend(["kisan", "agriculture"])
    elif profile.occupation == "self-employed":
        queries.extend(["vendor", "mudra"])
    elif profile.occupation == "unemployed":
        queries.extend(["skill training", "livelihood"])

    # 2. Demographic-specific queries
    if profile.disability:
        queries.append("disability")
    if profile.gender == "female":
        queries.append("women")
    if profile.category in ["sc", "st"]:
        queries.append(f"{profile.category.upper()} scholarship")
    if profile.bpl or profile.annual_income <= 150000:
        queries.extend(["awas", "ayushman"])

    # 3. State & general fallback query
    if not queries:
        queries.append("welfare")

    return list(dict.fromkeys(queries))  # Remove duplicates preserving order


async def fetch_schemes_live(keyword: str, state: str) -> list[dict]:
    """Call MyScheme.gov.in public search endpoint for a single keyword query."""
    params = {
        "keyword": keyword,
        "lang": "en",
        "state": state,
    }
    try:
        async with httpx.AsyncClient(timeout=10, headers=MYSCHEME_HEADERS) as client:
            resp = await client.get(MYSCHEME_API, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("data", {}).get("hits", {}).get("hits", [])
    except Exception as e:
        print(f"[WARN] MyScheme live API query for '{keyword}' failed: {e}")
    return []


def parse_scheme(raw: dict) -> Scheme:
    src = raw.get("_source", {})
    slug = (src.get("schemeSlug") or "").strip()
    name = src.get("schemeName", "Unknown Scheme")
    if slug:
        myscheme_url = f"https://www.myscheme.gov.in/schemes/{slug}"
    else:
        import urllib.parse
        myscheme_url = f"https://www.myscheme.gov.in/search?q={urllib.parse.quote(name)}"

    return Scheme(
        name=name,
        ministry=src.get("nodalMinistryName", "Government of India"),
        description=src.get("schemeShortTitle", src.get("schemeName", "")),
        benefit=src.get("benefitType", "Financial / Service benefit"),
        eligibility="; ".join(src.get("tags", ["Check official website for full eligibility criteria"])),
        url=myscheme_url,
        official_portal_url=None,
        myscheme_url=myscheme_url,
        is_verified=bool(slug or myscheme_url),
    )


def match_fallback_schemes(profile: CitizenProfile, queries: list[str]) -> list[Scheme]:
    """
    Fallback Search Engine:
    Matches citizen profile against official Government of India welfare catalog.
    Evaluates occupation, age limits, income caps, gender, and affirmative action categories.
    """
    matched: list[Scheme] = []

    for item in OFFICIAL_SCHEMES_CATALOG:
        # Check disability requirement
        if item.get("disability_required", False) and not profile.disability:
            continue

        # Check gender
        if "gender" in item and profile.gender.lower() not in item["gender"]:
            continue

        # Check age range
        if "min_age" in item and profile.age < item["min_age"]:
            continue
        if "max_age" in item and profile.age > item["max_age"]:
            continue

        # Check income threshold
        if "max_income" in item and profile.annual_income > item["max_income"] and not profile.bpl:
            continue

        # Check BPL
        if item.get("bpl_only", False) and not profile.bpl:
            continue

        # Check category restriction
        if "categories" in item and profile.category.lower() not in item["categories"]:
            continue

        # Score relevance based on occupation and keywords
        is_occupation_match = (
            "target_occupations" in item and profile.occupation.lower() in item["target_occupations"]
        )
        is_keyword_match = any(
            kw in " ".join(item.get("keywords", [])).lower() for kw in queries
        )

        if is_occupation_match or is_keyword_match or (item.get("max_income") and profile.bpl):
            matched.append(Scheme(
                name=item["name"],
                ministry=item["ministry"],
                description=item["description"],
                benefit=item["benefit"],
                eligibility=item["eligibility"],
                url=item["url"],
                official_portal_url=item.get("official_portal_url"),
                myscheme_url=item.get("myscheme_url"),
                is_verified=item.get("is_verified", True),
            ))

    # If still empty, return universal public security schemes
    if not matched:
        matched.append(Scheme(
            name="Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
            ministry="Ministry of Health and Family Welfare",
            description="Universal healthcare assurance cover for secondary and tertiary hospitalization across India.",
            benefit="Cashless cover of up to ₹5,00,000 per family per year",
            eligibility="Citizens belonging to eligible socioeconomic categories or low-to-middle income households",
            url="https://nha.gov.in/PM-JAY",
            official_portal_url="https://nha.gov.in/PM-JAY",
            myscheme_url="https://www.myscheme.gov.in/schemes/ab-pmjay",
            is_verified=True,
        ))

    return matched[:10]


# ── Endpoint ─────────────────────────────────────────────────────────────────
@router.post("/find", response_model=SchemeResponse)
async def find_schemes(profile: CitizenProfile):
    """
    Match citizen profile to live government welfare schemes.
    1. Splits traits into individual search keywords.
    2. Queries live government search API.
    3. Seamlessly triggers fallback search engine when queries yield 0 results.
    """
    queries = build_individual_queries(profile)
    schemes: list[Scheme] = []
    seen_names = set()

    # Step 1: Query live API with individual split keywords
    for q in queries[:3]:
        raw_hits = await fetch_schemes_live(q, profile.state)
        for hit in raw_hits:
            scheme_obj = parse_scheme(hit)
            if scheme_obj.name not in seen_names:
                seen_names.add(scheme_obj.name)
                schemes.append(scheme_obj)

    # Step 2: Trigger Fallback Search Engine if live API returned 0 hits
    if not schemes:
        schemes = match_fallback_schemes(profile, queries)

    profile_summary = (
        f"{profile.age}-year-old {profile.gender} from {profile.state}, "
        f"Category: {profile.category.upper()}, "
        f"Occupation: {profile.occupation.capitalize()}, "
        f"Annual Income: ₹{profile.annual_income:,}"
    )

    return SchemeResponse(
        total_found=len(schemes),
        schemes=schemes,
        profile_summary=profile_summary,
    )

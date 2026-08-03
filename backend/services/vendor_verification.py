from models.restaurant import Restaurant

VENDOR_VERIFICATION_STAGES = ("registration", "documentation", "pending_review", "verified")


def verification_stage_for_business(business: Restaurant | None) -> str:
    if not business:
        return "registration"
    if business.business_verified:
        return "verified"
    if business.verification_submitted_at:
        if business.verification_documents:
            return "pending_review"
        return "documentation"
    return "registration"


verification_stage_for_restaurant = verification_stage_for_business

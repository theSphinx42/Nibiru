"""Initialize the Nibiru Guardian admin profile with maximum tier glyphs."""

import os
import sys
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Import our models
from app.models.user import User
from app.models.glyph import UserGlyph, ItemGlyph, BusinessGlyph
from app.core.security import get_password_hash

# Database setup
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/nibiru"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_admin_profile(db: AsyncSession):
    # Create admin user
    admin = User(
        email="guardian@nibiru.site",
        hashed_password=get_password_hash("CHANGE_THIS_PASSWORD"),
        is_active=True,
        is_superuser=True,
        display_name="Nibiru Guardian",
        quantum_score=999,
        tier="mythic",
        contributions=9999,
        created_at=datetime.utcnow()
    )
    db.add(admin)
    await db.flush()

    # Create Tier 1 personal glyph (max rank)
    personal_glyph = UserGlyph(
        user_id=admin.id,
        tier=3,
        rank="mythic",
        effect="quantum_resonance",
        quantum_state="entangled",
        created_at=datetime.utcnow()
    )
    db.add(personal_glyph)

    # Create Tier 2 item glyph for DevControl
    item_glyph = ItemGlyph(
        user_id=admin.id,
        item_id="devcontrol-core",
        tier=2,
        rank="mythic",
        effect="reality_anchor",
        quantum_state="superposition",
        created_at=datetime.utcnow()
    )
    db.add(item_glyph)

    # Create Tier 3 business glyph
    business_glyph = BusinessGlyph(
        user_id=admin.id,
        tier=3,
        rank="mythic",
        effect="dimensional_seal",
        quantum_state="coherent",
        created_at=datetime.utcnow()
    )
    db.add(business_glyph)

    await db.commit()
    return admin

async def main():
    try:
        async with AsyncSessionLocal() as session:
            admin = await create_admin_profile(session)
            print(f"✨ Created admin profile: {admin.email}")
            print("🔐 WARNING: Please change the default password immediately!")
            print("🌟 Glyphs initialized with maximum quantum resonance")
    except Exception as e:
        print(f"❌ Error creating admin profile: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 
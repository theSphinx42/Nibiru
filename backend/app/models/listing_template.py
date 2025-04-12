from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Any

class ListingTemplateType(str, Enum):
    AI_MODEL = "ai_model"
    TOOLCHAIN = "toolchain"
    QUANTUM_CODEC = "quantum_codec"
    GLYPH_GENERATOR = "glyph_generator"
    DATA_PROCESSOR = "data_processor"
    SAPHIRA_SCRIPT = "saphira_script"

class ListingTemplate(BaseModel):
    id: str = Field(..., description="Unique identifier for the template")
    type: ListingTemplateType
    name: str = Field(..., description="Display name of the template")
    description: str = Field(..., description="Brief description of what this template is for")
    icon: str = Field(..., description="Icon identifier for the template")
    defaults: Dict[str, Any] = Field(..., description="Default values for listing fields")

    class Config:
        use_enum_values = True

# Predefined templates
LISTING_TEMPLATES = {
    "ai_model": ListingTemplate(
        id="ai_model",
        type=ListingTemplateType.AI_MODEL,
        name="AI Model",
        description="Quantum-enhanced AI/ML model for specialized tasks",
        icon="brain",
        defaults={
            "title_format": "{model_name} - Quantum AI Model",
            "description": "A quantum-enhanced AI model designed for {purpose}. Leveraging quantum computing to deliver superior performance in {task_type}.",
            "glyph_tier": 3,
            "category": "ai_and_ml",
            "suggested_price": {
                "basic": 49.99,
                "pro": 149.99,
                "enterprise": 499.99
            }
        }
    ),
    "toolchain": ListingTemplate(
        id="toolchain",
        type=ListingTemplateType.TOOLCHAIN,
        name="Toolchain/Plugin",
        description="Development tools and plugins for quantum workflows",
        icon="tools",
        defaults={
            "title_format": "{tool_name} - Quantum Development Tool",
            "description": "A specialized toolchain for {purpose}. Streamline your quantum development workflow with integrated {features}.",
            "glyph_tier": 2,
            "category": "developer_tools",
            "suggested_price": {
                "basic": 29.99,
                "pro": 99.99,
                "enterprise": 299.99
            }
        }
    ),
    "quantum_codec": ListingTemplate(
        id="quantum_codec",
        type=ListingTemplateType.QUANTUM_CODEC,
        name="Quantum Codec",
        description="Encoding and decoding solutions for quantum data",
        icon="codec",
        defaults={
            "title_format": "{codec_name} - Quantum Data Codec",
            "description": "Advanced quantum codec for {data_type}. Optimized for {use_case} with support for {formats}.",
            "glyph_tier": 4,
            "category": "quantum_computing",
            "suggested_price": {
                "basic": 79.99,
                "pro": 199.99,
                "enterprise": 599.99
            }
        }
    ),
    "glyph_generator": ListingTemplate(
        id="glyph_generator",
        type=ListingTemplateType.GLYPH_GENERATOR,
        name="Glyph Generator",
        description="Custom spirit glyph generation algorithms",
        icon="glyph",
        defaults={
            "title_format": "{generator_name} - Spirit Glyph Generator",
            "description": "Create unique spirit glyphs with {style} characteristics. Perfect for {application} with support for {features}.",
            "glyph_tier": 3,
            "category": "creative_tools",
            "suggested_price": {
                "basic": 39.99,
                "pro": 119.99,
                "enterprise": 399.99
            }
        }
    ),
    "data_processor": ListingTemplate(
        id="data_processor",
        type=ListingTemplateType.DATA_PROCESSOR,
        name="Data Processing Utility",
        description="Quantum data processing and analysis tools",
        icon="data",
        defaults={
            "title_format": "{utility_name} - Quantum Data Processor",
            "description": "Process and analyze quantum data for {purpose}. Features include {features} with optimization for {data_types}.",
            "glyph_tier": 2,
            "category": "data_analysis",
            "suggested_price": {
                "basic": 59.99,
                "pro": 179.99,
                "enterprise": 499.99
            }
        }
    ),
    "saphira_script": ListingTemplate(
        id="saphira_script",
        type=ListingTemplateType.SAPHIRA_SCRIPT,
        name="Saphira Script",
        description="Custom scripts and automations for the Saphira platform",
        icon="script",
        defaults={
            "title_format": "{script_name} - Saphira Automation",
            "description": "Automate your Saphira workflows with this script for {purpose}. Includes {features} and support for {integrations}.",
            "glyph_tier": 1,
            "category": "automation",
            "suggested_price": {
                "basic": 19.99,
                "pro": 69.99,
                "enterprise": 199.99
            }
        }
    )
} 
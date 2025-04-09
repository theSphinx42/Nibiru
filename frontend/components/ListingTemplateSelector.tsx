import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { 
  FaBrain, 
  FaTools, 
  FaCode, 
  FaPalette, 
  FaDatabase, 
  FaScroll 
} from 'react-icons/fa';

interface Template {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  defaults: {
    title_format: string;
    description: string;
    glyph_tier: number;
    category: string;
    suggested_price: {
      basic: number;
      pro: number;
      enterprise: number;
    };
  };
}

interface ListingTemplateSelectorProps {
  onSelect: (template: Template) => void;
}

const iconMap: Record<string, IconType> = {
  brain: FaBrain,
  tools: FaTools,
  codec: FaCode,
  glyph: FaPalette,
  data: FaDatabase,
  script: FaScroll,
};

const templates: Template[] = [
  {
    id: "ai_model",
    type: "ai_model",
    name: "AI Model",
    description: "Quantum-enhanced AI/ML model for specialized tasks",
    icon: "brain",
    defaults: {
      title_format: "{model_name} - Quantum AI Model",
      description: "A quantum-enhanced AI model designed for {purpose}. Leveraging quantum computing to deliver superior performance in {task_type}.",
      glyph_tier: 3,
      category: "ai_and_ml",
      suggested_price: {
        basic: 49.99,
        pro: 149.99,
        enterprise: 499.99
      }
    }
  },
  {
    id: "toolchain",
    type: "toolchain",
    name: "Toolchain/Plugin",
    description: "Development tools and plugins for quantum workflows",
    icon: "tools",
    defaults: {
      title_format: "{tool_name} - Quantum Development Tool",
      description: "A specialized toolchain for {purpose}. Streamline your quantum development workflow with integrated {features}.",
      glyph_tier: 2,
      category: "developer_tools",
      suggested_price: {
        basic: 29.99,
        pro: 99.99,
        enterprise: 299.99
      }
    }
  },
  {
    id: "quantum_codec",
    type: "quantum_codec",
    name: "Quantum Codec",
    description: "Encoding and decoding solutions for quantum data",
    icon: "codec",
    defaults: {
      title_format: "{codec_name} - Quantum Data Codec",
      description: "Advanced quantum codec for {data_type}. Optimized for {use_case} with support for {formats}.",
      glyph_tier: 4,
      category: "quantum_computing",
      suggested_price: {
        basic: 79.99,
        pro: 199.99,
        enterprise: 599.99
      }
    }
  },
  {
    id: "glyph_generator",
    type: "glyph_generator",
    name: "Glyph Generator",
    description: "Custom spirit glyph generation algorithms",
    icon: "glyph",
    defaults: {
      title_format: "{generator_name} - Spirit Glyph Generator",
      description: "Create unique spirit glyphs with {style} characteristics. Perfect for {application} with support for {features}.",
      glyph_tier: 3,
      category: "creative_tools",
      suggested_price: {
        basic: 39.99,
        pro: 119.99,
        enterprise: 399.99
      }
    }
  },
  {
    id: "data_processor",
    type: "data_processor",
    name: "Data Processing Utility",
    description: "Quantum data processing and analysis tools",
    icon: "data",
    defaults: {
      title_format: "{utility_name} - Quantum Data Processor",
      description: "Process and analyze quantum data for {purpose}. Features include {features} with optimization for {data_types}.",
      glyph_tier: 2,
      category: "data_analysis",
      suggested_price: {
        basic: 59.99,
        pro: 179.99,
        enterprise: 499.99
      }
    }
  },
  {
    id: "saphira_script",
    type: "saphira_script",
    name: "Saphira Script",
    description: "Custom scripts and automations for the Saphira platform",
    icon: "script",
    defaults: {
      title_format: "{script_name} - Saphira Automation",
      description: "Automate your Saphira workflows with this script for {purpose}. Includes {features} and support for {integrations}.",
      glyph_tier: 1,
      category: "automation",
      suggested_price: {
        basic: 19.99,
        pro: 69.99,
        enterprise: 199.99
      }
    }
  }
];

const ListingTemplateSelector: React.FC<ListingTemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-100">Choose a Template</h2>
        <p className="mt-2 text-gray-400">
          Select a template to quickly create a listing with recommended settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = iconMap[template.icon];
          
          return (
            <motion.button
              key={template.id}
              onClick={() => onSelect(template)}
              className="relative flex flex-col items-start p-6 bg-gray-800/50 
                       rounded-lg border border-gray-700/50 hover:border-indigo-500/50
                       transition-colors duration-200 text-left group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg
                            bg-indigo-500/20 text-indigo-400 mb-4
                            group-hover:bg-indigo-500/30 group-hover:text-indigo-300
                            transition-colors duration-200">
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {template.name}
              </h3>

              <p className="text-sm text-gray-400 mb-4 flex-grow">
                {template.description}
              </p>

              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-gray-500">
                  Tier {template.defaults.glyph_tier}
                </span>
                <span className="text-gray-500">
                  From ${template.defaults.suggested_price.basic}
                </span>
              </div>

              <div className="absolute inset-0 border border-indigo-500/0 rounded-lg
                            group-hover:border-indigo-500/50 transition-colors duration-200" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ListingTemplateSelector; 
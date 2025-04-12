from typing import Dict, List, Optional
import re
from datetime import datetime
import logging
from ..models.advertising import GalateaProject

logger = logging.getLogger(__name__)

class GalateaContentPolishService:
    """Service to automatically enhance and polish Galatea project content."""

    def __init__(self):
        self.technical_keywords = {
            'implementation', 'deployment', 'architecture', 'infrastructure',
            'optimization', 'algorithm', 'framework', 'integration', 'pipeline',
            'scalability', 'performance', 'backend', 'frontend', 'database',
            'api', 'microservices', 'cloud', 'security', 'testing'
        }

    async def polish_project_update(self, raw_update: Dict) -> Dict:
        """Transform raw developer updates into polished content."""
        try:
            # Extract key technical achievements
            technical_highlights = self._extract_technical_highlights(raw_update['content'])
            
            # Generate engaging title if none provided
            title = raw_update.get('title') or self._generate_highlight_title(technical_highlights)

            # Structure content sections
            content_sections = {
                'overview': self._create_overview(raw_update['content']),
                'technical_details': self._format_technical_details(technical_highlights),
                'impact': self._extract_impact_statements(raw_update['content']),
                'next_steps': self._extract_next_steps(raw_update['content'])
            }

            # Format media content
            media_content = self._organize_media_content(raw_update.get('media_urls', []))

            return {
                'title': title,
                'content_sections': content_sections,
                'media_content': media_content,
                'highlight_points': self._generate_highlight_points(technical_highlights),
                'suggested_tags': self._generate_tags(raw_update['content']),
                'polish_level': 'nibiru_enhanced'
            }

        except Exception as e:
            logger.error(f"Error polishing project update: {str(e)}")
            return raw_update

    def _extract_technical_highlights(self, content: str) -> List[Dict]:
        """Extract and categorize technical achievements from content."""
        highlights = []
        
        # Look for technical accomplishments
        for keyword in self.technical_keywords:
            pattern = f"(?i)(?:completed|implemented|improved|optimized|developed|launched).*?{keyword}.*?\\."
            matches = re.finditer(pattern, content)
            
            for match in matches:
                highlights.append({
                    'type': keyword,
                    'achievement': match.group(0),
                    'impact_level': self._assess_impact_level(match.group(0))
                })

        return highlights

    def _generate_highlight_title(self, highlights: List[Dict]) -> str:
        """Generate an engaging title from technical highlights."""
        if not highlights:
            return "Development Update"

        # Pick the highest impact highlight
        main_highlight = max(highlights, key=lambda x: x['impact_level'])
        
        # Transform into engaging title
        achievement = main_highlight['achievement'].strip('.')
        return f"🚀 {achievement.capitalize()} | Nibiru Enhanced"

    def _create_overview(self, content: str) -> str:
        """Create a polished overview section."""
        # Extract first paragraph or generate summary
        paragraphs = content.split('\n\n')
        overview = paragraphs[0] if paragraphs else content

        # Enhance with professional formatting
        return f"## Project Overview\n\n{overview}\n\n"

    def _format_technical_details(self, highlights: List[Dict]) -> str:
        """Format technical details into a structured section."""
        if not highlights:
            return ""

        sections = ["## Technical Achievements 🛠️\n"]
        
        # Group by type
        by_type = {}
        for highlight in highlights:
            by_type.setdefault(highlight['type'], []).append(highlight['achievement'])

        for tech_type, achievements in by_type.items():
            sections.append(f"\n### {tech_type.title()}\n")
            for achievement in achievements:
                sections.append(f"- {achievement}")

        return "\n".join(sections)

    def _extract_impact_statements(self, content: str) -> str:
        """Extract and format impact statements."""
        impact_patterns = [
            r"(?:improved|increased|reduced|optimized|enhanced).*?by.*?\d+%",
            r"(?:enables|allows|provides).*?(?:scalability|performance|efficiency)",
            r"(?:significant|substantial|major).*?improvement"
        ]

        impacts = []
        for pattern in impact_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            impacts.extend(match.group(0) for match in matches)

        if impacts:
            return "## Impact & Benefits 💫\n\n" + "\n".join(f"- {impact}" for impact in impacts)
        return ""

    def _extract_next_steps(self, content: str) -> str:
        """Extract and format upcoming development plans."""
        next_patterns = [
            r"(?:next|upcoming|planned|future).*?(?:steps?|phases?|developments?|features?)",
            r"(?:will|planning to|aiming to).*?(?:implement|develop|launch|release)"
        ]

        next_steps = []
        for pattern in next_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            next_steps.extend(match.group(0) for match in matches)

        if next_steps:
            return "## Next Steps 🎯\n\n" + "\n".join(f"- {step}" for step in next_steps)
        return ""

    def _organize_media_content(self, media_urls: List[str]) -> Dict:
        """Organize and categorize media content."""
        organized = {
            'videos': [],
            'images': [],
            'demos': [],
            'documents': []
        }

        for url in media_urls:
            if 'youtube' in url or 'vimeo' in url:
                organized['videos'].append({
                    'url': url,
                    'type': 'video',
                    'embed': True
                })
            elif any(ext in url.lower() for ext in ['.mp4', '.webm', '.mov']):
                organized['videos'].append({
                    'url': url,
                    'type': 'video',
                    'embed': False
                })
            elif any(ext in url.lower() for ext in ['.jpg', '.png', '.gif', '.webp']):
                organized['images'].append({
                    'url': url,
                    'type': 'image'
                })
            elif 'demo' in url.lower():
                organized['demos'].append({
                    'url': url,
                    'type': 'demo'
                })
            else:
                organized['documents'].append({
                    'url': url,
                    'type': 'document'
                })

        return organized

    def _generate_highlight_points(self, highlights: List[Dict]) -> List[str]:
        """Generate concise highlight points for quick overview."""
        return [
            highlight['achievement']
            for highlight in sorted(highlights, key=lambda x: x['impact_level'], reverse=True)[:3]
        ]

    def _generate_tags(self, content: str) -> List[str]:
        """Generate relevant tags for the update."""
        tags = set()
        
        # Add technical keywords found in content
        for keyword in self.technical_keywords:
            if keyword.lower() in content.lower():
                tags.add(f"#{keyword}")

        # Add development stage tags
        stage_keywords = ['prototype', 'alpha', 'beta', 'launch', 'production']
        for stage in stage_keywords:
            if stage.lower() in content.lower():
                tags.add(f"#{stage}")

        return sorted(list(tags))

    def _assess_impact_level(self, achievement: str) -> int:
        """Assess the impact level of an achievement (1-5)."""
        impact_words = {
            'revolutionary': 5,
            'major': 4,
            'significant': 4,
            'improved': 3,
            'enhanced': 3,
            'updated': 2,
            'fixed': 1
        }

        score = 1
        for word, value in impact_words.items():
            if word in achievement.lower():
                score = max(score, value)

        return score

    async def create_project_showcase(self, project_id: int, updates: List[Dict]) -> Dict:
        """Create a polished project showcase from multiple updates."""
        try:
            # Polish individual updates
            polished_updates = [
                await self.polish_project_update(update)
                for update in updates
            ]

            # Aggregate highlights
            all_highlights = []
            for update in polished_updates:
                all_highlights.extend(update.get('highlight_points', []))

            # Create showcase sections
            showcase = {
                'key_achievements': self._select_top_achievements(all_highlights),
                'development_timeline': self._create_timeline(polished_updates),
                'media_gallery': self._create_media_gallery(polished_updates),
                'technical_overview': self._create_technical_overview(polished_updates),
                'impact_summary': self._create_impact_summary(polished_updates)
            }

            return showcase

        except Exception as e:
            logger.error(f"Error creating project showcase: {str(e)}")
            return {'error': 'Failed to create showcase'}

    def _select_top_achievements(self, highlights: List[str]) -> List[str]:
        """Select the most significant achievements for showcase."""
        # Remove duplicates while preserving order
        unique_highlights = list(dict.fromkeys(highlights))
        return unique_highlights[:5]  # Return top 5 unique highlights

    def _create_timeline(self, updates: List[Dict]) -> List[Dict]:
        """Create a visual development timeline."""
        timeline = []
        for update in updates:
            if 'content_sections' in update:
                timeline.append({
                    'title': update['title'],
                    'date': update.get('created_at', datetime.now().isoformat()),
                    'highlights': update.get('highlight_points', []),
                    'media': self._select_best_media(update.get('media_content', {}))
                })
        return sorted(timeline, key=lambda x: x['date'])

    def _create_media_gallery(self, updates: List[Dict]) -> Dict:
        """Create an organized media gallery from all updates."""
        gallery = {
            'featured': [],
            'development': [],
            'technical': [],
            'presentations': []
        }

        for update in updates:
            media = update.get('media_content', {})
            # Select best media for each category
            for video in media.get('videos', []):
                if 'demo' in video.get('url', '').lower():
                    gallery['technical'].append(video)
                else:
                    gallery['featured'].append(video)
            
            for image in media.get('images', []):
                if 'diagram' in image.get('url', '').lower():
                    gallery['technical'].append(image)
                else:
                    gallery['development'].append(image)

        return gallery

    def _create_technical_overview(self, updates: List[Dict]) -> str:
        """Create a comprehensive technical overview."""
        tech_sections = []
        for update in updates:
            if 'content_sections' in update:
                tech_details = update['content_sections'].get('technical_details')
                if tech_details:
                    tech_sections.append(tech_details)
        
        return "\n\n".join(tech_sections)

    def _create_impact_summary(self, updates: List[Dict]) -> List[str]:
        """Create a summary of project impact points."""
        impact_points = []
        for update in updates:
            if 'content_sections' in update:
                impact = update['content_sections'].get('impact')
                if impact:
                    # Extract bullet points
                    points = re.findall(r'- (.+)', impact)
                    impact_points.extend(points)
        
        return list(dict.fromkeys(impact_points))  # Remove duplicates

    def _select_best_media(self, media_content: Dict) -> Optional[Dict]:
        """Select the best media content for timeline display."""
        # Prefer videos over images
        if media_content.get('videos'):
            return media_content['videos'][0]
        elif media_content.get('images'):
            return media_content['images'][0]
        return None 
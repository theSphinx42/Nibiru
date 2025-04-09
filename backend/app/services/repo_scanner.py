import os
import git
import shutil
import tempfile
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import re
import json
import time

from app.models.repo_scanner import (
    RepoSource,
    PackageGroup,
    ListingSuggestion,
    RepoAnalysis
)

class RepoScanner:
    def __init__(self, temp_dir: Optional[str] = None):
        self.temp_dir = temp_dir or tempfile.mkdtemp()
        self.common_dirs = {
            "source": ["src", "lib", "core", "app"],
            "tests": ["tests", "test"],
            "docs": ["docs", "documentation", "wiki"],
            "models": ["models", "ml", "ai"],
            "scripts": ["scripts", "tools", "utils"],
            "examples": ["examples", "samples", "demo"]
        }
        
    async def scan_github_repo(self, repo_url: str) -> RepoAnalysis:
        """Clone and scan a GitHub repository."""
        start_time = time.time()
        repo_path = os.path.join(self.temp_dir, self._get_repo_name(repo_url))
        
        try:
            # Clone repo
            git.Repo.clone_from(repo_url, repo_path)
            
            # Perform analysis
            analysis = await self._analyze_repo(
                repo_path=repo_path,
                repo_url=repo_url,
                source=RepoSource.GITHUB
            )
            
            return analysis
        finally:
            # Cleanup
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path)
                
    async def scan_local_repo(self, repo_path: str) -> RepoAnalysis:
        """Scan a local repository."""
        start_time = time.time()
        return await self._analyze_repo(
            repo_path=repo_path,
            source=RepoSource.LOCAL
        )
        
    async def _analyze_repo(
        self,
        repo_path: str,
        repo_url: Optional[str] = None,
        source: RepoSource = RepoSource.LOCAL
    ) -> RepoAnalysis:
        """Analyze a repository and generate suggestions."""
        # Get file statistics
        total_files = 0
        total_lines = 0
        language_stats: Dict[str, int] = {}
        
        for root, _, files in os.walk(repo_path):
            for file in files:
                if file.startswith('.') or file.startswith('__'):
                    continue
                    
                file_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1].lower()
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = len(f.readlines())
                        total_lines += lines
                        total_files += 1
                        language_stats[ext] = language_stats.get(ext, 0) + lines
                except:
                    continue
                    
        # Calculate language percentages
        total = sum(language_stats.values())
        language_breakdown = {
            lang: count/total * 100 
            for lang, count in language_stats.items()
        }
        
        # Identify package groups
        package_groups = await self._identify_package_groups(repo_path)
        
        # Generate listing suggestions
        listing_suggestions = await self._generate_listing_suggestions(
            package_groups,
            language_breakdown
        )
        
        return RepoAnalysis(
            repo_url=repo_url,
            repo_path=repo_path,
            source=source,
            total_files=total_files,
            total_lines=total_lines,
            language_breakdown=language_breakdown,
            package_groups=package_groups,
            listing_suggestions=listing_suggestions,
            analysis_timestamp=datetime.utcnow().isoformat(),
            scan_duration_ms=int((time.time() - start_time) * 1000)
        )
        
    async def _identify_package_groups(self, repo_path: str) -> List[PackageGroup]:
        """Identify logical package groups in the repository."""
        groups: List[PackageGroup] = []
        
        for root, dirs, files in os.walk(repo_path):
            rel_path = os.path.relpath(root, repo_path)
            if rel_path == '.':
                continue
                
            # Skip hidden directories
            if any(part.startswith('.') for part in rel_path.split(os.sep)):
                continue
                
            # Determine group type
            group_type = next(
                (key for key, patterns in self.common_dirs.items()
                 if any(pattern in rel_path.lower() for pattern in patterns)),
                "other"
            )
            
            # Get files in this directory
            group_files = [
                f for f in files
                if not f.startswith('.') and not f.startswith('__')
            ]
            
            if not group_files:
                continue
                
            # Calculate complexity score based on file types and sizes
            complexity_score = await self._calculate_complexity(
                root, group_files
            )
            
            # Generate suggested tags
            suggested_tags = await self._generate_tags(
                root, group_files, group_type
            )
            
            groups.append(PackageGroup(
                name=os.path.basename(root),
                path=rel_path,
                files=group_files,
                description=await self._generate_description(root, group_files),
                suggested_tier=min(3, max(1, int(complexity_score * 3))),
                suggested_tags=suggested_tags,
                type=group_type,
                complexity_score=complexity_score
            ))
            
        return groups
        
    async def _generate_listing_suggestions(
        self,
        package_groups: List[PackageGroup],
        language_breakdown: Dict[str, float]
    ) -> List[ListingSuggestion]:
        """Generate listing suggestions based on package groups."""
        suggestions: List[ListingSuggestion] = []
        
        # Group packages by type
        type_groups: Dict[str, List[PackageGroup]] = {}
        for group in package_groups:
            if group.type not in type_groups:
                type_groups[group.type] = []
            type_groups[group.type].append(group)
            
        # Generate a suggestion for each major component
        for group_type, groups in type_groups.items():
            if not groups:
                continue
                
            # Calculate average complexity
            avg_complexity = sum(g.complexity_score for g in groups) / len(groups)
            
            # Determine glyph tier based on complexity
            glyph_tier = min(3, max(1, int(avg_complexity * 3)))
            
            # Aggregate tags
            all_tags = set()
            for group in groups:
                all_tags.update(group.suggested_tags)
                
            # Generate pricing based on tier and complexity
            base_price = 50 * glyph_tier
            pricing = {
                "basic": base_price,
                "pro": base_price * 3,
                "enterprise": base_price * 10
            }
            
            suggestions.append(ListingSuggestion(
                title=f"{self._capitalize_type(group_type)} Component",
                description=await self._generate_component_description(groups),
                glyph_tier=glyph_tier,
                tags=list(all_tags)[:10],  # Limit to top 10 tags
                category=await self._determine_category(groups, language_breakdown),
                package_groups=groups,
                pricing_suggestion=pricing,
                quantum_score_estimate=avg_complexity * 100
            ))
            
        return suggestions
        
    @staticmethod
    def _get_repo_name(url: str) -> str:
        """Extract repository name from URL."""
        return url.rstrip('/').split('/')[-1]
        
    @staticmethod
    def _capitalize_type(type_name: str) -> str:
        """Capitalize and format type name."""
        return ' '.join(word.capitalize() for word in type_name.split('_'))
        
    async def _calculate_complexity(
        self,
        root: str,
        files: List[str]
    ) -> float:
        """Calculate complexity score for a group of files."""
        total_size = 0
        total_lines = 0
        
        for file in files:
            file_path = os.path.join(root, file)
            try:
                size = os.path.getsize(file_path)
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = len(f.readlines())
                total_size += size
                total_lines += lines
            except:
                continue
                
        # Normalize to 0-1 range (assuming most files < 1MB and 1000 lines)
        size_score = min(1.0, total_size / (1024 * 1024))
        lines_score = min(1.0, total_lines / 1000)
        
        return (size_score + lines_score) / 2
        
    async def _generate_tags(
        self,
        root: str,
        files: List[str],
        group_type: str
    ) -> List[str]:
        """Generate suggested tags based on files and group type."""
        tags = set([group_type])  # Start with group type
        
        # Add language tags
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext:
                tags.add(ext[1:])  # Remove dot
                
        # Add framework/library tags based on common patterns
        for file in files:
            if file.lower() in ['requirements.txt', 'package.json', 'cargo.toml']:
                try:
                    with open(os.path.join(root, file), 'r') as f:
                        content = f.read()
                        # Extract package names and add as tags
                        packages = re.findall(r'[\w-]+(?==|@|:)', content)
                        tags.update(packages[:5])  # Limit to top 5 packages
                except:
                    continue
                    
        return list(tags)
        
    async def _generate_description(
        self,
        root: str,
        files: List[str]
    ) -> str:
        """Generate a description for a package group."""
        file_types = set(os.path.splitext(f)[1].lower() for f in files)
        file_count = len(files)
        
        return (
            f"Package containing {file_count} files "
            f"with types: {', '.join(sorted(t for t in file_types if t))}"
        )
        
    async def _generate_component_description(
        self,
        groups: List[PackageGroup]
    ) -> str:
        """Generate a description for a component listing."""
        total_files = sum(len(g.files) for g in groups)
        group_names = ', '.join(g.name for g in groups[:3])
        
        return (
            f"Component containing {total_files} files across "
            f"{len(groups)} packages including {group_names}. "
            f"Suggested for {groups[0].type} integration."
        )
        
    async def _determine_category(
        self,
        groups: List[PackageGroup],
        language_breakdown: Dict[str, float]
    ) -> str:
        """Determine the most appropriate category for a listing."""
        # Simple heuristic based on file types and group type
        if any(g.type == "models" for g in groups):
            return "AI_AND_ML"
        elif any(g.type == "scripts" for g in groups):
            return "DEVELOPER_TOOLS"
        elif ".py" in language_breakdown and language_breakdown[".py"] > 50:
            return "QUANTUM_COMPUTING"
        else:
            return "DEVELOPER_TOOLS" 
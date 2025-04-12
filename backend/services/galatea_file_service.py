from typing import Dict, List, Optional, BinaryIO
import zipfile
import os
import hashlib
import magic
import logging
from pathlib import Path
from datetime import datetime
import ast
import subprocess
import tempfile
import re
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class SecurityScanResult:
    """Container for security scan results."""
    def __init__(self):
        self.vulnerabilities: List[Dict] = []
        self.code_quality_issues: List[Dict] = []
        self.malware_detected: bool = False
        self.risk_level: str = 'low'
        self.quarantined_files: List[str] = []
        self.strike_worthy: bool = False
        self.ai_fixable: bool = False
        self.sphinx_recompile_recommended: bool = False

class BuildQuality(Enum):
    QUANTUM_READY = "quantum_ready"
    SPHINX_ENHANCED = "sphinx_enhanced"
    STANDARD = "standard"
    NEEDS_REVIEW = "needs_review"

@dataclass
class BuildGlyph:
    tier: int
    quality: BuildQuality
    effects: List[str]
    quantum_compatible: bool
    achievement_points: int

class GalateaFileService:
    """Service to handle file management for Galatea projects with zip-first approach."""

    ALLOWED_EXTENSIONS = {
        '.zip', '.gz', '.tar', '.rar',  # Archives
        '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.h',  # Code
        '.md', '.txt', '.pdf', '.doc', '.docx',  # Documentation
        '.jpg', '.png', '.gif', '.webp',  # Images
        '.mp4', '.webm', '.mov'  # Videos
    }

    DANGEROUS_IMPORTS = {
        'os.system', 'subprocess.call', 'eval', 'exec',
        'requests.get', 'urllib.request', 'socket',
        'pickle.loads', 'marshal.loads'
    }

    SUSPICIOUS_PATTERNS = [
        r'(?:rm|del|remove).*-rf',  # Dangerous file operations
        r'(?:wget|curl).*\|.*(?:bash|sh)',  # Shell injection
        r'(?:eval|exec)\(.*input\(',  # Code injection
        r'os\..*(?:system|popen|spawn)',  # Shell commands
        r'subprocess\..*(?:call|run|Popen)',  # Process execution
        r'__import__\(.*\)',  # Dynamic imports
    ]

    MAX_ZIP_SIZE = 500 * 1024 * 1024  # 500MB
    MAX_SINGLE_FILE_SIZE = 100 * 1024 * 1024  # 100MB

    QUANTUM_COMPLIANCE_RULES = {
        'deterministic_output': True,
        'no_random_seeds': True,
        'stable_state_management': True,
        'quantum_safe_encryption': True,
        'reversible_computation': True
    }

    BUILD_ACHIEVEMENT_POINTS = {
        'clean_security_scan': 100,
        'quantum_ready': 500,
        'sphinx_enhanced': 250,
        'no_warnings': 150,
        'optimal_performance': 200
    }

    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def process_upload(self, file: BinaryIO, filename: str, project_id: int) -> Dict:
        """Process an uploaded file, converting to zip if necessary."""
        try:
            file_ext = Path(filename).suffix.lower()
            
            if file_ext not in self.ALLOWED_EXTENSIONS:
                raise ValueError(f"Unsupported file type: {file_ext}")

            # Generate unique storage path
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            project_dir = self.storage_path / str(project_id)
            project_dir.mkdir(exist_ok=True)

            if file_ext == '.zip':
                result = await self._process_zip(file, project_dir, timestamp)
            else:
                result = await self._convert_to_zip(file, filename, project_dir, timestamp)

            # Add security scan results
            scan_results = await self._security_scan(project_dir / result['filename'])
            
            # Check quantum compliance and build quality
            build_quality = await self._assess_build_quality(
                project_dir / result['filename'],
                scan_results
            )
            
            # Generate build glyph if qualified
            build_glyph = await self._generate_build_glyph(build_quality, scan_results)
            
            result.update({
                'security_scan': {
                    'risk_level': scan_results.risk_level,
                    'vulnerabilities_found': len(scan_results.vulnerabilities),
                    'quality_issues': len(scan_results.code_quality_issues),
                    'malware_detected': scan_results.malware_detected,
                    'quarantined_files': scan_results.quarantined_files,
                    'ai_fixable': scan_results.ai_fixable,
                    'sphinx_recompile_recommended': scan_results.sphinx_recompile_recommended
                },
                'build_quality': {
                    'status': build_quality.quality.value,
                    'quantum_compatible': build_quality.quantum_compatible,
                    'achievement_points': build_quality.achievement_points,
                    'glyph': {
                        'tier': build_glyph.tier,
                        'effects': build_glyph.effects,
                        'quality': build_glyph.quality.value
                    } if build_glyph else None
                }
            })

            if scan_results.strike_worthy:
                await self._record_security_strike(project_id)

            return result

        except Exception as e:
            logger.error(f"Error processing upload: {str(e)}")
            raise

    async def _process_zip(self, file: BinaryIO, project_dir: Path, timestamp: str) -> Dict:
        """Process and validate a zip file."""
        temp_path = project_dir / f"temp_{timestamp}.zip"
        final_path = project_dir / f"release_{timestamp}.zip"

        try:
            # Save temporary file
            with open(temp_path, 'wb') as f:
                f.write(file.read())

            # Validate zip
            if not self._validate_zip(temp_path):
                raise ValueError("Invalid or corrupted zip file")

            # Check size
            if temp_path.stat().st_size > self.MAX_ZIP_SIZE:
                raise ValueError(f"Zip file exceeds maximum size of {self.MAX_ZIP_SIZE/1024/1024}MB")

            # Move to final location
            temp_path.rename(final_path)

            # Generate metadata
            metadata = {
                'filename': final_path.name,
                'size': final_path.stat().st_size,
                'checksum': self._calculate_checksum(final_path),
                'timestamp': timestamp,
                'content_type': 'application/zip',
                'is_archive': True
            }

            return metadata

        finally:
            if temp_path.exists():
                temp_path.unlink()

    async def _convert_to_zip(self, file: BinaryIO, filename: str, project_dir: Path, timestamp: str) -> Dict:
        """Convert a single file to a zip archive."""
        temp_file = project_dir / f"temp_{timestamp}_{filename}"
        zip_path = project_dir / f"release_{timestamp}.zip"

        try:
            # Save temporary file
            with open(temp_file, 'wb') as f:
                f.write(file.read())

            # Check file size
            if temp_file.stat().st_size > self.MAX_SINGLE_FILE_SIZE:
                raise ValueError(f"File exceeds maximum size of {self.MAX_SINGLE_FILE_SIZE/1024/1024}MB")

            # Create zip with the file
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                zf.write(temp_file, filename)

            metadata = {
                'filename': zip_path.name,
                'original_filename': filename,
                'size': zip_path.stat().st_size,
                'checksum': self._calculate_checksum(zip_path),
                'timestamp': timestamp,
                'content_type': 'application/zip',
                'is_archive': True,
                'converted_from': Path(filename).suffix
            }

            return metadata

        finally:
            if temp_file.exists():
                temp_file.unlink()

    def _validate_zip(self, zip_path: Path) -> bool:
        """Validate zip file integrity and content."""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                # Test zip integrity
                if zf.testzip() is not None:
                    return False

                # Check for suspicious files
                for info in zf.infolist():
                    # Check for absolute paths or parent directory traversal
                    if info.filename.startswith('/') or '..' in info.filename:
                        return False
                    
                    # Check file extensions
                    if Path(info.filename).suffix.lower() not in self.ALLOWED_EXTENSIONS:
                        return False

                    # Check individual file sizes
                    if info.file_size > self.MAX_SINGLE_FILE_SIZE:
                        return False

            return True

        except zipfile.BadZipFile:
            return False

    def _calculate_checksum(self, file_path: Path) -> str:
        """Calculate SHA-256 checksum of a file."""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()

    async def compile_project(self, files: List[BinaryIO], filenames: List[str], project_id: int) -> Dict:
        """Compile multiple files into a single zip archive."""
        project_dir = self.storage_path / str(project_id)
        project_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_path = project_dir / f"compiled_{timestamp}.zip"

        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for file, filename in zip(files, filenames):
                    if Path(filename).suffix.lower() not in self.ALLOWED_EXTENSIONS:
                        raise ValueError(f"Unsupported file type: {filename}")
                    
                    # Create temporary file
                    temp_file = project_dir / f"temp_{filename}"
                    with open(temp_file, 'wb') as f:
                        f.write(file.read())
                    
                    # Add to zip
                    zf.write(temp_file, filename)
                    temp_file.unlink()

            metadata = {
                'filename': zip_path.name,
                'size': zip_path.stat().st_size,
                'checksum': self._calculate_checksum(zip_path),
                'timestamp': timestamp,
                'content_type': 'application/zip',
                'is_archive': True,
                'file_count': len(files)
            }

            return metadata

        except Exception as e:
            if zip_path.exists():
                zip_path.unlink()
            logger.error(f"Error compiling project: {str(e)}")
            raise

    async def verify_sphinx_compatibility(self, file_path: Path) -> Dict:
        """Verify if files are Sphinx compatible and offer compilation if needed."""
        try:
            is_sphinx = False
            needs_compilation = False
            sphinx_files = {'conf.py', 'index.rst', 'requirements.txt'}
            
            with zipfile.ZipFile(file_path, 'r') as zf:
                file_list = set(zf.namelist())
                # Check if it's already a Sphinx project
                is_sphinx = sphinx_files.intersection(file_list)
                # Check if it needs compilation
                needs_compilation = bool(file_list.intersection({'.md', '.txt', '.docx'}))

            return {
                'is_sphinx_compatible': is_sphinx,
                'needs_compilation': needs_compilation,
                'recommended_action': 'compile' if needs_compilation else 'none'
            }

        except Exception as e:
            logger.error(f"Error verifying Sphinx compatibility: {str(e)}")
            return {
                'is_sphinx_compatible': False,
                'needs_compilation': False,
                'error': str(e)
            }

    async def _security_scan(self, zip_path: Path) -> SecurityScanResult:
        """Perform comprehensive security scan on uploaded files."""
        scan_result = SecurityScanResult()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Extract zip for scanning
            with zipfile.ZipFile(zip_path, 'r') as zf:
                zf.extractall(temp_path)
                
            # Scan each file
            for root, _, files in os.walk(temp_path):
                for file in files:
                    file_path = Path(root) / file
                    
                    # Skip non-code files
                    if file_path.suffix not in {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.h'}:
                        continue

                    # Static Analysis
                    code_issues = await self._static_analysis(file_path)
                    if code_issues:
                        scan_result.code_quality_issues.extend(code_issues)
                    
                    # Security Vulnerabilities
                    vulns = await self._check_security_vulnerabilities(file_path)
                    if vulns:
                        scan_result.vulnerabilities.extend(vulns)
                        
                    # Check for malware signatures
                    if await self._check_malware(file_path):
                        scan_result.malware_detected = True
                        scan_result.quarantined_files.append(file)
                        scan_result.strike_worthy = True

            # Determine overall risk level
            scan_result.risk_level = self._calculate_risk_level(scan_result)
            
            # Check if issues are AI-fixable
            scan_result.ai_fixable = self._check_ai_fixable(scan_result)

        return scan_result

    async def _static_analysis(self, file_path: Path) -> List[Dict]:
        """Perform static code analysis."""
        issues = []
        
        try:
            if file_path.suffix == '.py':
                # Python-specific analysis
                with open(file_path, 'r') as f:
                    tree = ast.parse(f.read())
                    
                for node in ast.walk(tree):
                    # Check for dangerous imports
                    if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                        for name in node.names:
                            if name.name in self.DANGEROUS_IMPORTS:
                                issues.append({
                                    'type': 'dangerous_import',
                                    'description': f'Potentially dangerous import: {name.name}',
                                    'line': node.lineno,
                                    'severity': 'high'
                                })
                    
                    # Check for eval/exec usage
                    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                        if node.func.id in {'eval', 'exec'}:
                            issues.append({
                                'type': 'dangerous_call',
                                'description': f'Dangerous built-in call: {node.func.id}',
                                'line': node.lineno,
                                'severity': 'critical'
                            })

            # Run additional static analysis tools
            issues.extend(await self._run_linter(file_path))
            
        except Exception as e:
            logger.error(f"Error in static analysis: {str(e)}")
            issues.append({
                'type': 'analysis_error',
                'description': f'Failed to analyze file: {str(e)}',
                'severity': 'warning'
            })

        return issues

    async def _check_security_vulnerabilities(self, file_path: Path) -> List[Dict]:
        """Check for common security vulnerabilities."""
        vulnerabilities = []
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
                
            # Check for suspicious patterns
            for pattern in self.SUSPICIOUS_PATTERNS:
                if re.search(pattern, content):
                    vulnerabilities.append({
                        'type': 'suspicious_pattern',
                        'description': f'Potentially dangerous code pattern found: {pattern}',
                        'severity': 'high',
                        'ai_fixable': True
                    })

            # Check for hardcoded secrets
            if re.search(r'(?i)(?:password|secret|key|token).*=.*[\'"][^\'"]+[\'"]', content):
                vulnerabilities.append({
                    'type': 'hardcoded_secret',
                    'description': 'Possible hardcoded secret detected',
                    'severity': 'high',
                    'ai_fixable': True
                })

        except Exception as e:
            logger.error(f"Error checking vulnerabilities: {str(e)}")

        return vulnerabilities

    async def _check_malware(self, file_path: Path) -> bool:
        """Check file for malware signatures."""
        try:
            # Calculate file hash
            file_hash = self._calculate_checksum(file_path)
            
            # Check against known malware signatures
            # This would integrate with a malware database in production
            return False  # Placeholder
            
        except Exception as e:
            logger.error(f"Error in malware check: {str(e)}")
            return False

    def _calculate_risk_level(self, scan_result: SecurityScanResult) -> str:
        """Calculate overall risk level based on scan results."""
        if scan_result.malware_detected:
            return 'critical'
            
        high_severity_count = sum(
            1 for v in scan_result.vulnerabilities 
            if v.get('severity') == 'high'
        )
        
        if high_severity_count > 5:
            return 'high'
        elif high_severity_count > 2:
            return 'medium'
        elif scan_result.vulnerabilities or scan_result.code_quality_issues:
            return 'low'
        return 'safe'

    def _check_ai_fixable(self, scan_result: SecurityScanResult) -> bool:
        """Check if issues can be fixed by AI."""
        return any(
            v.get('ai_fixable', False) for v in scan_result.vulnerabilities
        ) or len(scan_result.code_quality_issues) > 0

    async def recompile_with_sphinx(self, file_path: Path) -> Optional[Dict]:
        """Recompile problematic code using Sphinx AI."""
        try:
            # This would integrate with Sphinx AI compilation service
            # Placeholder for now
            return {
                'status': 'success',
                'fixed_issues': [],
                'new_file_path': file_path
            }
        except Exception as e:
            logger.error(f"Error in Sphinx recompilation: {str(e)}")
            return None

    async def _run_linter(self, file_path: Path) -> List[Dict]:
        """Run appropriate linter based on file type."""
        issues = []
        try:
            if file_path.suffix == '.py':
                # Run pylint or flake8
                pass
            elif file_path.suffix in {'.js', '.ts', '.jsx', '.tsx'}:
                # Run eslint
                pass
            # Add more language-specific linters as needed
        except Exception as e:
            logger.error(f"Error running linter: {str(e)}")
        
        return issues

    async def _record_security_strike(self, project_id: int):
        """Record security strike against project."""
        try:
            # This would integrate with your strike system
            logger.warning(f"Security strike recorded for project {project_id}")
        except Exception as e:
            logger.error(f"Error recording security strike: {str(e)}")

    async def _assess_build_quality(self, file_path: Path, scan_results: SecurityScanResult) -> BuildQuality:
        """Assess the build quality and quantum compliance of the upload."""
        try:
            quantum_checks = await self._check_quantum_compliance(file_path)
            performance_metrics = await self._analyze_performance(file_path)
            
            # Calculate achievement points
            points = 0
            effects = []
            
            # Security points
            if scan_results.risk_level == 'safe':
                points += self.BUILD_ACHIEVEMENT_POINTS['clean_security_scan']
                effects.append('secure_build')
            
            # Quantum compliance points
            if all(quantum_checks.values()):
                points += self.BUILD_ACHIEVEMENT_POINTS['quantum_ready']
                effects.append('quantum_ready')
            
            # Performance points
            if performance_metrics.get('optimal', False):
                points += self.BUILD_ACHIEVEMENT_POINTS['optimal_performance']
                effects.append('performance_optimized')
            
            # Determine quality level
            if points >= 800:  # Quantum Ready
                quality = BuildQuality.QUANTUM_READY
            elif points >= 500:  # Sphinx Enhanced
                quality = BuildQuality.SPHINX_ENHANCED
            elif points >= 200:  # Standard
                quality = BuildQuality.STANDARD
            else:
                quality = BuildQuality.NEEDS_REVIEW

            return BuildGlyph(
                tier=self._calculate_tier(points),
                quality=quality,
                effects=effects,
                quantum_compatible=all(quantum_checks.values()),
                achievement_points=points
            )

        except Exception as e:
            logger.error(f"Error assessing build quality: {str(e)}")
            return BuildGlyph(
                tier=1,
                quality=BuildQuality.NEEDS_REVIEW,
                effects=[],
                quantum_compatible=False,
                achievement_points=0
            )

    async def _check_quantum_compliance(self, file_path: Path) -> Dict[str, bool]:
        """Check if the code meets quantum compliance standards."""
        compliance_results = dict(self.QUANTUM_COMPLIANCE_RULES)
        
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                with zipfile.ZipFile(file_path, 'r') as zf:
                    zf.extractall(temp_path)
                
                for root, _, files in os.walk(temp_path):
                    for file in files:
                        if file.endswith(('.py', '.js', '.ts')):
                            file_path = Path(root) / file
                            with open(file_path, 'r') as f:
                                content = f.read()
                            
                            # Check for non-deterministic operations
                            if re.search(r'random\.|Math\.random|crypto\.random', content):
                                compliance_results['deterministic_output'] = False
                            
                            # Check for proper state management
                            if re.search(r'global\s+\w+|window\.\w+\s*=', content):
                                compliance_results['stable_state_management'] = False
                            
                            # Check for quantum-safe encryption
                            if re.search(r'(rsa|dsa|ecdsa)\.|crypto\.subtle', content, re.I):
                                compliance_results['quantum_safe_encryption'] = False
                            
                            # Check for reversible computation patterns
                            if not self._check_reversible_computation(content):
                                compliance_results['reversible_computation'] = False

        except Exception as e:
            logger.error(f"Error checking quantum compliance: {str(e)}")
            return dict.fromkeys(self.QUANTUM_COMPLIANCE_RULES.keys(), False)

        return compliance_results

    def _check_reversible_computation(self, content: str) -> bool:
        """Check if the code follows reversible computation patterns."""
        # Look for destructive operations
        destructive_patterns = [
            r'(?<!\w)del\s+\w+',  # Deletion without backup
            r'\w+\.pop\(',  # Pop without assignment
            r'(?<!\w)clear\(',  # Clear operations
            r'\w+\s*=\s*None',  # Direct None assignment
        ]
        
        return not any(re.search(pattern, content) for pattern in destructive_patterns)

    async def _analyze_performance(self, file_path: Path) -> Dict:
        """Analyze code performance characteristics."""
        try:
            metrics = {
                'optimal': True,
                'issues': []
            }
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                with zipfile.ZipFile(file_path, 'r') as zf:
                    zf.extractall(temp_path)
                
                for root, _, files in os.walk(temp_path):
                    for file in files:
                        if file.endswith(('.py', '.js', '.ts')):
                            file_path = Path(root) / file
                            with open(file_path, 'r') as f:
                                content = f.read()
                            
                            # Check for performance anti-patterns
                            if re.search(r'while\s*True:', content):
                                metrics['optimal'] = False
                                metrics['issues'].append('infinite_loop_risk')
                            
                            if re.search(r'\.sleep\(|setTimeout\(|setInterval\(', content):
                                metrics['optimal'] = False
                                metrics['issues'].append('blocking_operations')
                            
                            if re.search(r'O\(n\^2\)|nested_loop', content):
                                metrics['optimal'] = False
                                metrics['issues'].append('quadratic_complexity')

            return metrics

        except Exception as e:
            logger.error(f"Error analyzing performance: {str(e)}")
            return {'optimal': False, 'issues': ['analysis_failed']}

    def _calculate_tier(self, points: int) -> int:
        """Calculate glyph tier based on achievement points."""
        if points >= 800:
            return 3  # Quantum Ready
        elif points >= 500:
            return 2  # Enhanced
        return 1  # Standard

    async def _generate_build_glyph(self, build_quality: BuildGlyph, scan_results: SecurityScanResult) -> Optional[BuildGlyph]:
        """Generate a glyph for builds that meet quality standards."""
        if scan_results.risk_level not in ['safe', 'low']:
            return None
            
        effects = []
        
        # Add special effects based on achievements
        if build_quality.quantum_compatible:
            effects.append('quantum_shimmer')
        if scan_results.risk_level == 'safe':
            effects.append('security_aura')
        if build_quality.achievement_points >= 500:
            effects.append('sphinx_enhanced')
        
        return BuildGlyph(
            tier=build_quality.tier,
            quality=build_quality.quality,
            effects=effects,
            quantum_compatible=build_quality.quantum_compatible,
            achievement_points=build_quality.achievement_points
        ) 
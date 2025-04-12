from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.marketplace import CodeListing, Transaction, AuditLog
from app.models.invocation_key import InvocationKey
from app.core.config import settings
import json
from collections import defaultdict

class AIAssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.user_patterns = defaultdict(list)
        self.context_history = defaultdict(list)
        self.last_interaction = defaultdict(lambda: datetime.min)

    async def get_user_context(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive user context for personalized assistance."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        # Get recent user activity
        recent_audits = self.db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.created_at.desc()).limit(10).all()

        # Get user's listings and transactions
        listings = self.db.query(CodeListing).filter(
            CodeListing.creator_id == user_id
        ).all()

        transactions = self.db.query(Transaction).filter(
            Transaction.buyer_id == user_id
        ).order_by(Transaction.created_at.desc()).limit(5).all()

        # Analyze user patterns
        patterns = self._analyze_user_patterns(user_id, recent_audits)

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at,
                "last_login": user.last_login
            },
            "recent_activity": [
                {
                    "action": audit.action,
                    "entity_type": audit.entity_type,
                    "timestamp": audit.created_at
                }
                for audit in recent_audits
            ],
            "listings": [
                {
                    "id": listing.id,
                    "title": listing.title,
                    "status": listing.status,
                    "price": listing.price
                }
                for listing in listings
            ],
            "recent_transactions": [
                {
                    "id": tx.id,
                    "amount": tx.amount,
                    "status": tx.status,
                    "created_at": tx.created_at
                }
                for tx in transactions
            ],
            "patterns": patterns
        }

    def _analyze_user_patterns(self, user_id: int, recent_audits: List[AuditLog]) -> Dict[str, Any]:
        """Analyze user behavior patterns from audit logs."""
        patterns = {
            "frequent_actions": defaultdict(int),
            "common_entities": defaultdict(int),
            "time_patterns": defaultdict(int)
        }

        for audit in recent_audits:
            # Track action frequencies
            patterns["frequent_actions"][audit.action] += 1
            
            # Track entity interactions
            patterns["common_entities"][audit.entity_type] += 1
            
            # Track time patterns (hour of day)
            patterns["time_patterns"][audit.created_at.hour] += 1

        return patterns

    async def get_contextual_suggestions(self, user_id: int, current_page: str) -> List[Dict[str, Any]]:
        """Get personalized suggestions based on user context and current page."""
        context = await self.get_user_context(user_id)
        suggestions = []

        # Get time since last interaction
        last_interaction = self.last_interaction[user_id]
        time_since_last = datetime.utcnow() - last_interaction

        # Don't suggest if we've interacted recently
        if time_since_last < timedelta(minutes=5):
            return []

        # Page-specific suggestions
        if current_page == "listings":
            suggestions.extend(self._get_listing_suggestions(context))
        elif current_page == "transactions":
            suggestions.extend(self._get_transaction_suggestions(context))
        elif current_page == "dashboard":
            suggestions.extend(self._get_dashboard_suggestions(context))

        # Add general suggestions based on patterns
        suggestions.extend(self._get_pattern_based_suggestions(context))

        # Update last interaction time
        self.last_interaction[user_id] = datetime.utcnow()

        return suggestions

    def _get_listing_suggestions(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get suggestions related to listings."""
        suggestions = []
        listings = context.get("listings", [])

        # Check for draft listings
        draft_listings = [l for l in listings if l["status"] == "DRAFT"]
        if draft_listings:
            suggestions.append({
                "type": "action",
                "message": "You have draft listings. Would you like to review and publish them?",
                "action": "review_drafts",
                "priority": "high"
            })

        # Check for price updates
        recent_price_updates = [
            audit for audit in context.get("recent_activity", [])
            if audit["action"] == "update_listing" and "price" in audit.get("metadata", {})
        ]
        if recent_price_updates:
            suggestions.append({
                "type": "insight",
                "message": "I notice you've updated some prices. Would you like to see how this affects your sales projections?",
                "action": "view_projections",
                "priority": "medium"
            })

        return suggestions

    def _get_transaction_suggestions(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get suggestions related to transactions."""
        suggestions = []
        transactions = context.get("recent_transactions", [])

        # Check for pending transactions
        pending_tx = [tx for tx in transactions if tx["status"] == "PENDING"]
        if pending_tx:
            suggestions.append({
                "type": "action",
                "message": "You have pending transactions. Would you like to review them?",
                "action": "review_pending",
                "priority": "high"
            })

        # Check for recent successful transactions
        recent_successful = [
            tx for tx in transactions
            if tx["status"] == "COMPLETED" and
            (datetime.utcnow() - tx["created_at"]).days < 7
        ]
        if recent_successful:
            suggestions.append({
                "type": "insight",
                "message": "You've had successful transactions this week. Would you like to see your revenue trends?",
                "action": "view_trends",
                "priority": "medium"
            })

        return suggestions

    def _get_dashboard_suggestions(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get suggestions for the dashboard."""
        suggestions = []
        patterns = context.get("patterns", {})

        # Check for common actions
        frequent_actions = patterns.get("frequent_actions", {})
        if "revoke_key" in frequent_actions and frequent_actions["revoke_key"] > 5:
            suggestions.append({
                "type": "insight",
                "message": "I notice you've been managing keys frequently. Would you like to see a summary of your key management activity?",
                "action": "view_key_summary",
                "priority": "medium"
            })

        # Check for time patterns
        time_patterns = patterns.get("time_patterns", {})
        if time_patterns:
            peak_hours = sorted(time_patterns.items(), key=lambda x: x[1], reverse=True)[:3]
            suggestions.append({
                "type": "insight",
                "message": f"Your most active hours are {', '.join(str(h) for h, _ in peak_hours)}. Would you like to schedule some tasks for these times?",
                "action": "schedule_tasks",
                "priority": "low"
            })

        return suggestions

    def _get_pattern_based_suggestions(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get suggestions based on user behavior patterns."""
        suggestions = []
        patterns = context.get("patterns", {})
        recent_activity = context.get("recent_activity", [])

        # Check for repeated actions
        frequent_actions = patterns.get("frequent_actions", {})
        if "create_listing" in frequent_actions and frequent_actions["create_listing"] > 3:
            suggestions.append({
                "type": "tip",
                "message": "You've created several listings. Would you like to learn about bulk listing creation to save time?",
                "action": "learn_bulk",
                "priority": "low"
            })

        # Check for common entity interactions
        common_entities = patterns.get("common_entities", {})
        if "invocation_key" in common_entities and common_entities["invocation_key"] > 10:
            suggestions.append({
                "type": "tip",
                "message": "You frequently work with invocation keys. Would you like to set up automated key management?",
                "action": "setup_automation",
                "priority": "medium"
            })

        return suggestions

    async def update_user_patterns(self, user_id: int, action: str, entity_type: str):
        """Update user behavior patterns."""
        self.user_patterns[user_id].append({
            "action": action,
            "entity_type": entity_type,
            "timestamp": datetime.utcnow()
        })

        # Keep only recent patterns (last 30 days)
        cutoff = datetime.utcnow() - timedelta(days=30)
        self.user_patterns[user_id] = [
            pattern for pattern in self.user_patterns[user_id]
            if pattern["timestamp"] > cutoff
        ]

    async def get_faq_suggestions(self, user_id: int, query: str) -> List[Dict[str, Any]]:
        """Get relevant FAQ suggestions based on user query and context."""
        context = await self.get_user_context(user_id)
        patterns = context.get("patterns", {})
        
        # Map common queries to FAQ topics
        faq_mapping = {
            "listing": ["How to create listings", "Pricing strategies", "Listing optimization"],
            "transaction": ["Payment processing", "Transaction status", "Refund process"],
            "key": ["Key management", "Revocation process", "Usage tracking"],
            "dashboard": ["Performance metrics", "Revenue tracking", "Analytics"]
        }

        # Find relevant FAQ topics based on user patterns and query
        relevant_topics = []
        for keyword, topics in faq_mapping.items():
            if keyword in query.lower() or any(
                keyword in action.lower() 
                for action in patterns.get("frequent_actions", {})
            ):
                relevant_topics.extend(topics)

        return [
            {
                "topic": topic,
                "relevance": "high" if keyword in query.lower() else "medium"
            }
            for topic in set(relevant_topics)
        ] 
"""create crypto transactions table

Revision ID: 001
Revises: 
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create enum type for transaction status
    op.execute("CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled')")
    
    # Create crypto_transactions table
    op.create_table(
        'crypto_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('network', sa.String(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=18, scale=6), nullable=False),
        sa.Column('from_address', sa.String(), nullable=False),
        sa.Column('to_address', sa.String(), nullable=False),
        sa.Column('gas_estimate', sa.Integer(), nullable=False),
        sa.Column('gas_price', sa.Integer(), nullable=False),
        sa.Column('tx_hash', sa.String(), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', name='transaction_status'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_crypto_transactions_user_id', 'crypto_transactions', ['user_id'])
    op.create_index('ix_crypto_transactions_status', 'crypto_transactions', ['status'])
    op.create_index('ix_crypto_transactions_created_at', 'crypto_transactions', ['created_at'])
    op.create_index('ix_crypto_transactions_tx_hash', 'crypto_transactions', ['tx_hash'], unique=True)

def downgrade():
    # Drop indexes
    op.drop_index('ix_crypto_transactions_tx_hash')
    op.drop_index('ix_crypto_transactions_created_at')
    op.drop_index('ix_crypto_transactions_status')
    op.drop_index('ix_crypto_transactions_user_id')
    
    # Drop table
    op.drop_table('crypto_transactions')
    
    # Drop enum type
    op.execute('DROP TYPE transaction_status') 
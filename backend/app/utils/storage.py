import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import os
from datetime import datetime
import uuid

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

async def upload_to_s3(file: UploadFile, prefix: str) -> str:
    """
    Upload a file to S3 and return the file key
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        file_ext = os.path.splitext(file.filename)[1]
        file_key = f"{prefix}/{timestamp}_{unique_id}{file_ext}"
        
        # Upload file to S3
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_BUCKET_NAME,
            file_key
        )
        
        return file_key
    except ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file to S3: {str(e)}"
        )

async def delete_from_s3(file_key: str) -> bool:
    """
    Delete a file from S3
    """
    try:
        s3_client.delete_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=file_key
        )
        return True
    except ClientError:
        return False

def get_s3_url(file_key: str) -> str:
    """
    Get the S3 URL for a file
    """
    return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{file_key}" 
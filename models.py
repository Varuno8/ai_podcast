from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    title = Column(String, nullable=True) # Will be populated in future
    content_file = Column(String) # Path relative to history dir
    script_file = Column(String)  # Path relative to history dir
    audio_file = Column(String, nullable=True) # Path relative to history dir
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    persona = Column(String, default="investigator")
    depth = Column(String, default="deep_dive")
    show_notes = Column(Text, nullable=True)
    chapters = Column(Text, nullable=True) # JSON string
    social_assets = Column(Text, nullable=True) # JSON string
    guest_persona = Column(Text, nullable=True) # JSON string

class ListenLaterItem(Base):
    __tablename__ = "listen_later"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String, unique=True, index=True)
    source = Column(String) # e.g., "Trending", "Manual"
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    is_processed = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, ForeignKey("episodes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    timestamp_seconds = Column(Integer) # For timeline comments
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    episode = relationship("Episode")

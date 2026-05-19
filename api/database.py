from sqlalchemy import create_engine, Column, String, Integer, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()
engine = create_engine("sqlite:///./vibeinvest.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class AnalysisSession(Base):
    __tablename__ = "analyses"
    id = Column(String, primary_key=True, index=True)
    startup_name = Column(String, index=True)
    final_score = Column(Integer, nullable=True)
    combined_result = Column(JSON, nullable=True)

class AgentResult(Base):
    __tablename__ = "agent_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("analyses.id"))
    agent_name = Column(String)
    summary = Column(String)
    raw_data = Column(JSON)

# Create the tables
Base.metadata.create_all(bind=engine)

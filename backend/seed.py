import sys
import os
import random
import uuid

# Adjust path to find app module
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db import SessionLocal, engine
from app.models import Base, Job, Candidate

def seed():
    Base.metadata.create_all(engine)
    session = SessionLocal()
    
    # Check if we already seeded
    if session.query(Job).first():
        session.close()
        return


    job_roles = [
        {
            "title": "Software Engineer",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Mid-Level",
            "description": "We are looking for a skilled Software Engineer with Python and React experience.",
            "required_skills": ["Python", "React", "SQL"]
        },
        {
            "title": "Product Manager",
            "department": "Product",
            "location": "New York, NY",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "description": "Seeking an experienced Product Manager to lead our core platform team and drive product strategy.",
            "required_skills": ["Agile", "Product Strategy", "User Research", "Data Analytics"]
        },
        {
            "title": "Data Scientist",
            "department": "Data",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Entry-Level",
            "description": "Join our data team to build predictive models and uncover insights from large datasets.",
            "required_skills": ["Python", "Machine Learning", "Pandas", "Scikit-Learn"]
        },
        {
            "title": "UX/UI Designer",
            "department": "Design",
            "location": "San Francisco, CA",
            "employment_type": "Contract",
            "experience_level": "Mid-Level",
            "description": "Looking for a creative UX/UI designer to revamp our user interfaces and create engaging user experiences.",
            "required_skills": ["Figma", "Prototyping", "User Testing", "CSS"]
        }
    ]

    first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Nina", "Oscar", "Paul", "Quinn"]
    last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"]
    roles_current = ["Developer", "Manager", "Analyst", "Designer", "Engineer", "Consultant"]

    total_jobs_seeded = 0
    total_candidates_seeded = 0

    for role in job_roles:
        job_slug = f"{role['title'].lower().replace(' ', '-')}-{random.randint(1000, 9999)}"
        job = Job(
            id=str(uuid.uuid4()),
            slug=job_slug,
            title=role["title"],
            department=role["department"],
            location=role["location"],
            employment_type=role["employment_type"],
            experience_level=role["experience_level"],
            description=role["description"],
            required_skills=role["required_skills"],
            status="active"
        )
        session.add(job)
        session.flush()
        total_jobs_seeded += 1

        # Seed 5 to 10 candidates per job
        num_candidates = random.randint(5, 10)
        for i in range(num_candidates):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{random.randint(100,999)}@example.com"
            
            candidate = Candidate(
                id=str(uuid.uuid4()),
                job_id=job.id,
                full_name=name,
                email=email,
                phone=f"555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                years_experience=str(random.randint(1, 15)),
                current_role=f"Senior {random.choice(roles_current)}",
                education="B.S. Relevant Degree",
                resume_text=f"Resume for {name}. Experienced in {', '.join(role['required_skills'][:2])}. Working in the industry for {random.randint(1, 15)} years.",
                overall_score=random.randint(40, 98),
                skills_match=random.randint(40, 98),
                experience_relevance=random.randint(40, 98),
                education_fit=random.randint(40, 98),
                ai_summary=f"{name} appears to be a good match for the {job.title} role with relevant skills.",
                status=random.choice(["new", "interviewing", "rejected", "hired"]),
                skills_detected=role["required_skills"] if random.random() > 0.4 else role["required_skills"][:2]
            )
            session.add(candidate)
            total_candidates_seeded += 1

    session.commit()
    print(f"Successfully seeded {total_jobs_seeded} jobs and {total_candidates_seeded} candidates.")

if __name__ == "__main__":
    seed()

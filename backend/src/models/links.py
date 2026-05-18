from uuid import UUID
from sqlmodel import Field, SQLModel

class SchoolStudentLink(SQLModel, table=True):
    __tablename__ = "school_student_links"

    school_id: UUID = Field(foreign_key="schools.id", primary_key=True)
    student_id: UUID = Field(foreign_key="students.id", primary_key=True)

class ParentStudentLink(SQLModel, table=True):
    __tablename__ = "parent_student_links"

    parent_id: int = Field(foreign_key="user.id", primary_key=True)
    student_id: UUID = Field(foreign_key="students.id", primary_key=True)

class TeacherSchoolLink(SQLModel, table=True):
    __tablename__ = "teacher_school_links"

    teacher_id: int = Field(foreign_key="user.id", primary_key=True)
    school_id: UUID = Field(foreign_key="schools.id", primary_key=True)

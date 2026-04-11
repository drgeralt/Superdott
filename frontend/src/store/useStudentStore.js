const { createContext, useContext, useState, useCallback } = React;

const StudentContext = createContext(null);

const StudentProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8000/api/students');
            if (!res.ok) throw new Error('Falha ao buscar alunos');
            const data = await res.json();
            setStudents(data);
            if (data.length > 0) setSelectedStudent(data[0]);
        } catch (err) {
            setError('Não foi possível conectar ao servidor.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectStudent = useCallback((student) => {
        setSelectedStudent(student);
    }, []);

    return (
        <StudentContext.Provider value={{
            students,
            selectedStudent,
            isLoading,
            error,
            fetchStudents,
            selectStudent,
        }}>
            {children}
        </StudentContext.Provider>
    );
};

const useStudentStore = (selector) => {
    const context = useContext(StudentContext);
    if (!context) throw new Error('useStudentStore deve ser usado dentro do StudentProvider');
    return selector(context);
};

window.StudentProvider = StudentProvider;
window.useStudentStore = useStudentStore;
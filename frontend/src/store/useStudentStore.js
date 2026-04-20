import { create } from 'zustand';

const useStudentStore = create((set) => ({
    students: [],
    selectedStudent: null,
    isLoading: true,
    error: null,

    fetchStudents: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/students');
            if (!res.ok) throw new Error('Falha ao buscar alunos');
            const data = await res.json();
            set({
                students: data,
                selectedStudent: data.length > 0 ? data[0] : null,
                isLoading: false,
            });
        } catch {
            set({ error: 'Não foi possível conectar ao servidor.', isLoading: false });
        }
    },

    selectStudent: (student) => set({ selectedStudent: student }),
}));

export default useStudentStore;
import { create } from 'zustand';

const useStudentStore = create((set) => ({
    students: [],
    allStudents: [],
    selectedStudent: null,
    selectedTurma: '',
    isLoading: true,
    error: null,

    fetchStudents: async (schoolId = null) => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            let url = '/api/students';
            if (schoolId) {
                url += `?school_id=${schoolId}`;
            }
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error('Falha ao buscar alunos');
            const data = await res.json();
            
            set((state) => {
                const filtered = state.selectedTurma 
                    ? data.filter(s => s.turma === state.selectedTurma) 
                    : data;
                    
                return {
                    allStudents: data,
                    students: filtered,
                    selectedStudent: filtered.length > 0 ? filtered[0] : null,
                    isLoading: false,
                };
            });
        } catch {
            set({ error: 'Não foi possível conectar ao servidor.', isLoading: false });
        }
    },

    setTurma: (turma) => set((state) => {
        const filtered = turma 
            ? state.allStudents.filter(s => s.turma === turma) 
            : state.allStudents;
            
        return {
            selectedTurma: turma,
            students: filtered,
            selectedStudent: filtered.length > 0 ? filtered[0] : null
        };
    }),

    selectStudent: (student) => set({ selectedStudent: student }),
}));

export default useStudentStore;
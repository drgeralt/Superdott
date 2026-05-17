import React from 'react';
import StudentList from './StudentList';
import TalentMap from './TalentMap';
import AIChat from './AIChat';

const TeacherDashboard = () => {
    return (
        <div className="grid grid-cols-12 gap-6 items-start animate-[fadeIn_0.5s_ease-out]">
            <StudentList />
            <TalentMap />
            <AIChat />
        </div>
    );
};

export default TeacherDashboard;

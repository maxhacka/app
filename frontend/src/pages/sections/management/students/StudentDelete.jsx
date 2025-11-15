import React, { useState } from "react";

export default function StudentDelete() {
  const [studentId, setStudentId] = useState("");

  const handleDelete = () => console.log("Удалить студента:", studentId);

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Удалить студента</h1>
      <input
        type="text"
        placeholder="ID студента"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="w-full p-3 border border-slate-200 rounded-lg"
      />
      <button
        onClick={handleDelete}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Удалить
      </button>
    </section>
  );
}

import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SectionPage from "./pages/SectionPage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import AdminPostPage from "./pages/AdminPostPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import {
  ManagementMain,
  StudentList,
  StudentFind,
  StudentCreate,
  StudentUpdate,
  StudentDelete,
  TeacherList,
  TeacherFind,
  TeacherCreate,
  TeacherUpdate,
  TeacherDelete,
  StatisticList,
} from "./pages/sections/management";

import {
  TimetableMain,
  ScheduleList,
  ScheduleDetails,
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleDelete,
  TemplateList,
  TemplateDetails,
  TemplateCreate,
  TemplateUpdate,
  TemplateDelete,
  ChangeList,
  ChangeDetails,
  ChangeCreate,
  ChangeUpdate,
  ChangeDelete,
} from "./pages/sections/timetable";

import {
  EventsMain,
  EventList,
  EventDetails,
  EventCreate,
  EventUpdate,
  EventDelete,
  RegistrationList,
  RegistrationDetails,
  RegistrationCreate,
  RegistrationUpdate,
  RegistrationDelete,
  FeedbackList,
  FeedbackDetails,
  FeedbackCreate,
  FeedbackUpdate,
  FeedbackDelete,
} from "./pages/sections/events";

import {
  CertificatesMain,
  CertificateList,
  CertificateDetails,
  CertificateCreate,
  CertificateUpdate,
  CertificateDelete,
  CertificateTypeList,
  CertificateTypeDetails,
  CertificateTypeCreate,
  CertificateTypeUpdate,
  CertificateTypeDelete,
  CertificateTemplateList,
  CertificateTemplateDetails,
  CertificateTemplateCreate,
  CertificateTemplateUpdate,
  CertificateTemplateDelete,
  CertificateStatisticList,
} from "./pages/sections/certificates";

import {
  ApplicantsMain,
  ApplicantList,
  ApplicantDetails,
  ApplicantCreate,
  ApplicantUpdate,
  ApplicantDelete,
  DocumentList,
  DocumentDetails,
  DocumentCreate,
  DocumentUpdate,
  DocumentDelete,
  ExamList,
  ExamDetails,
  ExamCreate,
  ExamUpdate,
  ExamDelete,
  ApplicantStatisticList,
} from "./pages/sections/applicants";

import {
  LibraryMain,
  BooksList,
  BooksDetails,
  BooksCreate,
  BooksUpdate,
  BooksDelete,
  LoansList,
  LoansDetails,
  LoansCreate,
  LoansUpdate,
  LoansDelete,
  ReservationsList,
  ReservationsDetails,
  ReservationsCreate,
  ReservationsUpdate,
  ReservationsDelete,
  ReviewsList,
  ReviewsDetails,
  ReviewsCreate,
  ReviewsUpdate,
  ReviewsDelete,
  LibraryStatisticsList,
} from "./pages/sections/library";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },

      { path: "section/:sectionId", element: <SectionPage /> },

      // Управление
      { path: "section/management", element: <ManagementMain /> },

      // Студенты
      { path: "section/management/students/list", element: <StudentList /> },
      { path: "section/management/students/find", element: <StudentFind /> },
      {
        path: "section/management/students/create",
        element: <StudentCreate />,
      },
      {
        path: "section/management/students/update",
        element: <StudentUpdate />,
      },
      {
        path: "section/management/students/delete",
        element: <StudentDelete />,
      },

      // Преподаватели
      { path: "section/management/teachers/list", element: <TeacherList /> },
      { path: "section/management/teachers/find", element: <TeacherFind /> },
      {
        path: "section/management/teachers/create",
        element: <TeacherCreate />,
      },
      {
        path: "section/management/teachers/update",
        element: <TeacherUpdate />,
      },
      {
        path: "section/management/teachers/delete",
        element: <TeacherDelete />,
      },

      // Статистика (Секция управление)
      {
        path: "section/management/statistics/list",
        element: <StatisticList />,
      },

      // Timetable
      { path: "section/timetable", element: <TimetableMain /> },

      // Schedule
      { path: "section/timetable/schedule/list", element: <ScheduleList /> },
      {
        path: "section/timetable/schedule/details",
        element: <ScheduleDetails />,
      },
      {
        path: "section/timetable/schedule/create",
        element: <ScheduleCreate />,
      },
      {
        path: "section/timetable/schedule/update",
        element: <ScheduleUpdate />,
      },
      {
        path: "section/timetable/schedule/delete",
        element: <ScheduleDelete />,
      },

      // Templates
      { path: "section/timetable/templates/list", element: <TemplateList /> },
      {
        path: "section/timetable/templates/details",
        element: <TemplateDetails />,
      },
      {
        path: "section/timetable/templates/create",
        element: <TemplateCreate />,
      },
      {
        path: "section/timetable/templates/update",
        element: <TemplateUpdate />,
      },
      {
        path: "section/timetable/templates/delete",
        element: <TemplateDelete />,
      },

      // Changes
      { path: "section/timetable/changes/list", element: <ChangeList /> },
      { path: "section/timetable/changes/details", element: <ChangeDetails /> },
      { path: "section/timetable/changes/create", element: <ChangeCreate /> },
      { path: "section/timetable/changes/update", element: <ChangeUpdate /> },
      { path: "section/timetable/changes/delete", element: <ChangeDelete /> },

      // Events
      { path: "section/events", element: <EventsMain /> },

      // Events (events/events)
      { path: "section/events/events/list", element: <EventList /> },
      { path: "section/events/events/details", element: <EventDetails /> },
      { path: "section/events/events/create", element: <EventCreate /> },
      { path: "section/events/events/update", element: <EventUpdate /> },
      { path: "section/events/events/delete", element: <EventDelete /> },

      // Registrations
      {
        path: "section/events/registrations/list",
        element: <RegistrationList />,
      },
      {
        path: "section/events/registrations/details",
        element: <RegistrationDetails />,
      },
      {
        path: "section/events/registrations/create",
        element: <RegistrationCreate />,
      },
      {
        path: "section/events/registrations/update",
        element: <RegistrationUpdate />,
      },
      {
        path: "section/events/registrations/delete",
        element: <RegistrationDelete />,
      },

      // Feedbacks
      { path: "section/events/feedbacks/list", element: <FeedbackList /> },
      {
        path: "section/events/feedbacks/details",
        element: <FeedbackDetails />,
      },
      { path: "section/events/feedbacks/create", element: <FeedbackCreate /> },
      { path: "section/events/feedbacks/update", element: <FeedbackUpdate /> },
      { path: "section/events/feedbacks/delete", element: <FeedbackDelete /> },

      // Certificates
      { path: "section/certificates", element: <CertificatesMain /> },

      // Certificates → Сертификаты
      {
        path: "section/certificates/certificates/list",
        element: <CertificateList />,
      },
      {
        path: "section/certificates/certificates/details",
        element: <CertificateDetails />,
      },
      {
        path: "section/certificates/certificates/create",
        element: <CertificateCreate />,
      },
      {
        path: "section/certificates/certificates/update",
        element: <CertificateUpdate />,
      },
      {
        path: "section/certificates/certificates/delete",
        element: <CertificateDelete />,
      },

      // Certificates → Типы сертификатов
      {
        path: "section/certificates/types/list",
        element: <CertificateTypeList />,
      },
      {
        path: "section/certificates/types/details",
        element: <CertificateTypeDetails />,
      },
      {
        path: "section/certificates/types/create",
        element: <CertificateTypeCreate />,
      },
      {
        path: "section/certificates/types/update",
        element: <CertificateTypeUpdate />,
      },
      {
        path: "section/certificates/types/delete",
        element: <CertificateTypeDelete />,
      },

      // Certificates → Шаблоны сертификатов
      {
        path: "section/certificates/templates/list",
        element: <CertificateTemplateList />,
      },
      {
        path: "section/certificates/templates/details",
        element: <CertificateTemplateDetails />,
      },
      {
        path: "section/certificates/templates/create",
        element: <CertificateTemplateCreate />,
      },
      {
        path: "section/certificates/templates/update",
        element: <CertificateTemplateUpdate />,
      },
      {
        path: "section/certificates/templates/delete",
        element: <CertificateTemplateDelete />,
      },

      // Certificates → Статистика
      {
        path: "section/certificates/statistics/list",
        element: <CertificateStatisticList />,
      },

      // Applicants
      { path: "section/applicants", element: <ApplicantsMain /> },

      // Applicants → Заявления
      {
        path: "section/applicants/applicants/list",
        element: <ApplicantList />,
      },
      {
        path: "section/applicants/applicants/details",
        element: <ApplicantDetails />,
      },
      {
        path: "section/applicants/applicants/create",
        element: <ApplicantCreate />,
      },
      {
        path: "section/applicants/applicants/update",
        element: <ApplicantUpdate />,
      },
      {
        path: "section/applicants/applicants/delete",
        element: <ApplicantDelete />,
      },

      // Applicants → Документы
      { path: "section/applicants/documents/list", element: <DocumentList /> },
      {
        path: "section/applicants/documents/details",
        element: <DocumentDetails />,
      },
      {
        path: "section/applicants/documents/create",
        element: <DocumentCreate />,
      },
      {
        path: "section/applicants/documents/update",
        element: <DocumentUpdate />,
      },
      {
        path: "section/applicants/documents/delete",
        element: <DocumentDelete />,
      },

      // Applicants → Экзамены
      { path: "section/applicants/exams/list", element: <ExamList /> },
      { path: "section/applicants/exams/details", element: <ExamDetails /> },
      { path: "section/applicants/exams/create", element: <ExamCreate /> },
      { path: "section/applicants/exams/update", element: <ExamUpdate /> },
      { path: "section/applicants/exams/delete", element: <ExamDelete /> },

      // Applicants → Статистика
      {
        path: "section/applicants/statistics/list",
        element: <ApplicantStatisticList />,
      },

      // Library
      { path: "section/library", element: <LibraryMain /> },

      // Library → Книги
      { path: "section/library/books/list", element: <BooksList /> },
      { path: "section/library/books/details", element: <BooksDetails /> },
      { path: "section/library/books/create", element: <BooksCreate /> },
      { path: "section/library/books/update", element: <BooksUpdate /> },
      { path: "section/library/books/delete", element: <BooksDelete /> },

      // Library → Выдачи
      { path: "section/library/loans/list", element: <LoansList /> },
      { path: "section/library/loans/details", element: <LoansDetails /> },
      { path: "section/library/loans/create", element: <LoansCreate /> },
      { path: "section/library/loans/update", element: <LoansUpdate /> },
      { path: "section/library/loans/delete", element: <LoansDelete /> },

      // Library → Резервации
      {
        path: "section/library/reservations/list",
        element: <ReservationsList />,
      },
      {
        path: "section/library/reservations/details",
        element: <ReservationsDetails />,
      },
      {
        path: "section/library/reservations/create",
        element: <ReservationsCreate />,
      },
      {
        path: "section/library/reservations/update",
        element: <ReservationsUpdate />,
      },
      {
        path: "section/library/reservations/delete",
        element: <ReservationsDelete />,
      },

      // Library → Отзывы
      { path: "section/library/reviews/list", element: <ReviewsList /> },
      { path: "section/library/reviews/details", element: <ReviewsDetails /> },
      { path: "section/library/reviews/create", element: <ReviewsCreate /> },
      { path: "section/library/reviews/update", element: <ReviewsUpdate /> },
      { path: "section/library/reviews/delete", element: <ReviewsDelete /> },

      // Library → Статистика
      {
        path: "section/library/statistics/list",
        element: <LibraryStatisticsList />,
      },

      { path: "event/:eventId", element: <EventPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "admin/post", element: <AdminPostPage /> },
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  // страницы без Layout
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

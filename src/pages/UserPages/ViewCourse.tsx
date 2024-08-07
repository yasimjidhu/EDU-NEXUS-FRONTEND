import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { PlayCircle, Clock, FileText, CheckCircle } from "lucide-react";
import {
  getCourse,
  updateAssessmentCompletion,
  updateLessonProgress,
} from "../../components/redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../components/redux/store/store";
import ReactPlayer from "react-player";
import Certificate from "../../components/student/Certficate";

interface Attachment {
  title?: string;
  url?: string;
}

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface Assessment {
  _id: string;
  title: string;
  total_score: number;
  passing_score: number;
  course_id: string;
  instructor_id: string;
  assessment_type: string;
  questions: Question[];
}

interface Lesson {
  _id?: string;
  lessonNumber: string;
  title: string;
  description: string;
  video: string;
  duration?: string;
  attachments: Attachment[];
  assessment?: Assessment;
}

interface CourseEntity {
  _id?: string;
  title: string;
  description: string;
  lessons: Lesson[];
  assessments: Assessment[];
}

const ViewCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseEntity | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<{
    [key: string]: number;
  }>({});
  const [totalLesson, setTotalLesson] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null
  );
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await dispatch(getCourse(courseId));
        setCourse(response.payload.course);

        if (response.payload.course.lessons.length > 0) {
          setTotalLesson(response.payload.course.lessons.length);
          setCurrentLesson(response.payload.course.lessons[0]);
        }

        const initialProgress = response.payload.course.lessons.reduce(
          (acc, lesson) => {
            acc[lesson.lessonNumber] = 0;
            return acc;
          },
          {}
        );

        setLessonProgress(initialProgress);

        const savedCompletedLessons = localStorage.getItem(
          `completedLessons-${courseId}-${user._id}`
        );
        if (savedCompletedLessons) {
          setCompletedLessons(new Set(JSON.parse(savedCompletedLessons)));
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId, dispatch, user]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setShowAssessment(false);
    setCurrentAssessment(null);
    setUserAnswers({});
    setAssessmentResult(null);
  };

  const handleStartAssessment = () => {
    if (course && course.assessments && course.assessments.length > 0) {
      setCurrentAssessment(course.assessments[0]);
      setShowAssessment(true);
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleSubmitAssessment = () => {
   
    if (!currentAssessment) return;

    const unansweredQuestions = currentAssessment.questions.filter(
      (question) => !userAnswers[question._id]
    );

    if (unansweredQuestions.length > 0) {
      setFormErrors(
        unansweredQuestions.map((q) => `Please answer question: ${q.question}`)
      );
      return;
    }

    // Clear any previous errors
    setFormErrors([]);
    const correctAnswers = currentAssessment.questions.reduce(
      (count, question) => {
        const userAnswer = userAnswers[question._id]?.trim().toLowerCase();
        const correctAnswer = question.answer.trim().toLowerCase();
        return count + (userAnswer === correctAnswer ? 1 : 0);
      },
      0
    );

    const score =
      (correctAnswers / currentAssessment.questions.length) *
      currentAssessment.total_score;
    setAssessmentResult(score);
  };

  useEffect(() => {
    if (completedLessons.size === totalLesson && totalLesson > 0) {
      setCourseCompleted(true);
      if (user?._id) {
        dispatch(updateAssessmentCompletion({ userId: user._id, courseId }));
      }
    }
  }, [completedLessons, totalLesson, user, courseId, dispatch]);
  

  const handleVideoProgress = useCallback(
    (progress: number) => {
      if (!currentLesson || !user) return;

      setLessonProgress((prev) => ({
        ...prev,
        [currentLesson.lessonNumber]: progress,
      }));

      if (progress >= 95 && !completedLessons.has(currentLesson._id || "")) {
        dispatch(
          updateLessonProgress({
            userId: user._id,
            courseId,
            lessonId: currentLesson._id || "",
            progress: 100,
            totalLesson: totalLesson,
          })
        )
          .then(() => {
            const updatedCompletedLessons = new Set(completedLessons).add(
              currentLesson._id || ""
            );
            setCompletedLessons(updatedCompletedLessons);
            localStorage.setItem(
              `completedLessons-${courseId}-${user._id}`,
              JSON.stringify(Array.from(updatedCompletedLessons))
            );
            if (updatedCompletedLessons.size === totalLesson) {
              setCourseCompleted(true);
            }
          })
          .catch((error) => {
            console.error("Error updating lesson progress:", error);
          });
      }
    },

    [currentLesson, user, courseId, dispatch, completedLessons, totalLesson]
  );

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {currentLesson && (
              <div className="bg-black w-full h-96 rounded-lg overflow-hidden shadow-lg mb-6">
                <ReactPlayer
                  url={currentLesson.video}
                  controls
                  width="100%"
                  height="100%"
                  onProgress={({ played }) => handleVideoProgress(played * 100)}
                />
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {currentLesson?.title || course.title}
              </h1>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" /> {course.lessons.length}{" "}
                    lessons
                  </span>
                </div>
              </div>
              <p className="text-gray-600">
                {currentLesson?.description || course.description}
              </p>
            </div>

            {currentLesson?.attachments &&
              currentLesson.attachments.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                  <ul className="space-y-2">
                    {currentLesson.attachments.map((attachment, index) => (
                      <li key={index} className="flex items-center">
                        <FileText size={16} className="mr-2 text-blue-500" />
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          {attachment.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {courseCompleted && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                <p className="font-bold">Course Completed!</p>
              </div>
            )}
            {/* Assessment Section */}
            {courseCompleted &&
              course.assessments.length > 0 &&
              (!showAssessment ? (
                <button
                  onClick={handleStartAssessment}
                  className="bg-medium-rose text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Start Assessment
                </button>
              ) : (
                <div>
                  <h4 className="text-xl font-bold mb-4 text-center">
                    {currentAssessment?.title}
                  </h4>
                  <div className="flex-col items-start mb-6">
                    <p className="inter">
                      Total Score: {currentAssessment?.total_score}
                    </p>
                    <p className="inter">
                      Passing Score: {currentAssessment?.passing_score}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitAssessment();
                    }}
                  >
                    {formErrors.length > 0 && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formErrors.map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    )}
                    {currentAssessment &&
                      currentAssessment.questions.length > 0 && (
                        <div
                          key={
                            currentAssessment.questions[currentQuestionIndex]
                              ._id
                          }
                          className="mb-6"
                        >
                          <p className="font-semibold mb-2">
                            {
                              currentAssessment.questions[currentQuestionIndex]
                                .question
                            }
                          </p>
                          <div className="space-y-2">
                            {currentAssessment.questions[
                              currentQuestionIndex
                            ].options.map((option) => (
                              <label
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${currentAssessment.questions[currentQuestionIndex]._id}`}
                                  value={option}
                                  onChange={() =>
                                    handleAnswerSelect(
                                      currentAssessment.questions[
                                        currentQuestionIndex
                                      ]._id,
                                      option
                                    )
                                  }
                                  checked={
                                    userAnswers[
                                      currentAssessment.questions[
                                        currentQuestionIndex
                                      ]._id
                                    ] === option
                                  }
                                  className="form-radio cursor-pointer"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    {currentQuestionIndex <
                      (currentAssessment?.questions.length || 0) - 1 && (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="bg-medium-rose text-white px-4 py-1 rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    )}
                    {currentQuestionIndex ===
                      (currentAssessment?.questions.length || 0) - 1 && (
                      <button
                        type="submit"
                        className="bg-medium-rose text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Submit Assessment
                      </button>
                    )}
                  </form>
                  {assessmentResult !== null && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <h3 className="text-xl text-center font-semibold">
                        Your Score: {assessmentResult}/
                        {currentAssessment?.total_score}
                      </h3>
                      {assessmentResult >=
                      (currentAssessment?.passing_score || 0) ? (
                        <p className="text-green-700 inter text-xl text-center mt-2">
                          Congratulations! You passed the assessment.
                        </p>
                      ) : (
                        <p className="text-red-600 inter text-center mt-2">
                          You didn't pass. Consider reviewing the course
                          material and trying again.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {courseCompleted && (
              <Certificate
                studentName={`${user?.firstName} ${user?.lastName}`}
                courseName={course.title}
              />
            )}
          </div>

          {/* Sidebar - Lesson list */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Course Content</h2>
              <ul className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <li
                    key={lesson.lessonNumber}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentLesson?._id === lesson._id
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <PlayCircle size={12} className="mr-1" />
                          <span className="mr-2">Video</span>
                          {lesson.duration && (
                            <>
                              <Clock size={12} className="mr-1" />
                              <span>{lesson.duration}</span>
                            </>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${lessonProgress[lesson.lessonNumber]}%`,
                            }}
                          ></div>
                        </div>
                        {completedLessons.has(lesson._id || "") && (
                          <div className="flex items-center text-green-600 font-semibold mt-2">
                            <CheckCircle size={16} className="mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;

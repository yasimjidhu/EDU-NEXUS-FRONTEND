import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../components/redux/store/store";
import { useParams } from "react-router-dom";
import {
  CourseState,
  checkEnrollment,
  enrollToCourse,
  getCourse,
  getReviews,
} from "../../components/redux/slices/courseSlice";
import {
  Book,
  Users,
  GraduationCap,
  Linkedin,
  Twitter,
  Globe,
  Languages,
  DollarSign,
  ExternalLink,
  Paperclip,
  IndianRupee,
} from "lucide-react";
import {  fetchVerifiedInstructors } from "../../components/redux/slices/instructorSlice";
import { CompletionStatus } from "../../types/enrollment";
import { toast } from "react-toastify";
import { getAllUsers } from "../../components/redux/slices/studentSlice";
import {  Elements } from "@stripe/react-stripe-js";
import {makePayment } from "../../components/redux/slices/paymentSlice";
import { loadStripe } from "@stripe/stripe-js";
import CourseDetailsSkelton from "../../components/skelton/CourseDetails";

const CourseDetails: React.FC = () => {

  const { id } = useParams();
  // const stripe = useStripe()
  // const elements = useElements()
  // const [loading,setLoading] = useState(false)
  const dispatch: AppDispatch = useDispatch();
  const [courseData, setCourseData] = useState<CourseState | null>(null);
  const [trial, setTrial] = useState<string | null>(null);
  const [allInstructors, setAllInstructors] = useState<any[]>([]);
  const [openLesson, setOpenLesson] = useState(null);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [courseId, setCourseId] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useSelector((state: RootState) => state.user);
  // const courseStoredData = useSelector((state: RootState) => state.course);

  // const toggleLesson = (index:any) => {
  //   setOpenLesson(openLesson === index ? null : index);
  // };

  console.log(userReviews)
  console.log(allUsers)
  console.log()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        const courseResponse = await dispatch(getCourse(id!));
        console.log('response of getcourse',courseResponse.payload)
        const course = courseResponse.payload.course;
        setCourseId(course._id);
        setCourseData(course);
        setIsLoading(false)
        setOpenLesson(null)
        setTrial(course.trial.video);
      } catch (error) {
        setIsLoading(false)
        console.error('Error fetching course:', error);
      }
    };

    const fetchInstructors = async () => {
      try {
        const instructorsResponse = await dispatch(fetchVerifiedInstructors());
        setAllInstructors(instructorsResponse.payload.instructors);
        console.log('allinstructors',instructorsResponse.payload.instructors)
      } catch (error) {
        console.error('Error fetching verified instructors:', error);
      }
    };

    fetchCourse();
    fetchInstructors();
  }, [dispatch, id]);

  useEffect(() => {
    if (!courseData?._id || !user?._id) {
      return
    }
      const checkUserEnrollment = async () => {
        try {
          const res = await dispatch(
            checkEnrollment({ courseId: courseData._id, userId: user._id })
          ).unwrap();
          setEnrolled(res.studentEnrolled);
        } catch (error) {
          console.error("Error checking enrollment:", error);
        }
      };

      checkUserEnrollment();
    
  }, [dispatch, courseData, user, enrolled]);

  useEffect(() => {
    if (courseId) {
      dispatch(getReviews({ courseId })).then((action) => {
        setUserReviews(action.payload)
      });
    }
  }, [dispatch, courseId]);

  const getInstructorAccountId =async ()=>{
    const instructor =await allInstructors.find((user)=>user._id == courseData?.instructorRef)
    console.log('instructor stripe account id',instructor.stripeAccountId)
    return instructor.stripeAccountId
  }

  useEffect(() => {
    dispatch(getAllUsers()).then((res) => setAllUsers(res.payload));
  }, []);

  const handleEnrollment = async () => {
    if (!courseData || !user) {
      toast.error("Course data or user information is missing");
      return;
    }
    console.log('user in course details',user)
    try {
  
      if (courseData.pricing.type === "free") {
        // Handle free course enrollment
        try{
          const enrollmentInfo = {
            userId: user._id,
            courseId: courseData._id,
            enrolledAt: new Date().toISOString(),
            completionStatus: 'enrolled' as CompletionStatus,
            progress: {
              completedLessons: [],
              completedAssessments: [],
              overallCompletionPercentage: 0,
            },
          } as any
          const enrolledStudent = await dispatch(enrollToCourse(enrollmentInfo));
          setEnrolled(true);
          toast.success(enrolledStudent.payload.message);
        }catch(error:any){
          console.log(error)
          toast.error(error.message)
        }
      } else {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        
        if (!stripe) {
          throw new Error("Failed to load Stripe");
        }
  
        if (!user._id || !courseData._id) {
          throw new Error('User or course information is incomplete');
        }
        
        const adminAccountId = import.meta.env.VITE_STRIPE_ADMIN_ACCOUNT_ID || ''
        const instructorAccountId = await getInstructorAccountId()

        const paymentResponse = await dispatch(makePayment({
          user_id: user._id,
          instructor_id:courseData.instructorRef,
          course_id: courseData._id,
          amount: courseData.pricing.amount,
          currency: 'inr',
          course_name: courseData.title,
          email:user.email,
          adminAccountId:adminAccountId,
          instructorAccountId:instructorAccountId
        })) as any

  
        if (paymentResponse.payload.data && paymentResponse.payload.data.id) {
          const result = await stripe.redirectToCheckout({
            sessionId: paymentResponse.payload.data.id,
          });
  
          if (result.error) {
            throw new Error(result.error.message);
          }
        } else {
          throw new Error("Failed to create checkout session");
        }
      }
    } catch (error) {
      console.error('Error processing enrollment:', error);
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
    }
  };
  
    enum Need {
      NAME = "name",
      PROFILE = "profile",
    }

    interface Instructor {
      _id: string;
      firstName: string;
      lastName: string;
      profile: string;
    }
  
    const getInstructorData = (
    
      instructorId: string | undefined,
      need: Need
    ): string | Instructor | null => {
      const instructor = allInstructors.find(
        (inst: Instructor) => inst._id === instructorId
      );
      
  
      if (!instructor) {
        return null;
      }
  
      if (need === Need.NAME) {
        return `${instructor.firstName} ${instructor.lastName}`;
      } else if (need === Need.PROFILE) {
        return instructor.profile.avatar;
      }
      return null;
    };
  
    const publishable_key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
    const stripePromise = loadStripe(publishable_key);  
  
  return (
    <>
    {isLoading ?
    (
      <CourseDetailsSkelton/>
    ):(
      <Elements stripe={stripePromise}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h1 className="inter text-2xl mt-4 font-bold mb-4">
                {courseData?.title}
              </h1>
              <div className="flex justify-center">
                <img
                  src={courseData?.thumbnail?.toString()}
                  alt="Course Thumbnail"
                  className="w-full rounded-lg shadow-lg mb-6"
                />
              </div>
              <p className="text-gray-600 mb-6">{courseData?.description}</p>
              <div className="flex justify-between items-center">
                {courseData?.pricing.type === "free" ? (
                  <div className="flex ">
                    <DollarSign className="w-6 h-6 mr-2 text-green-700" />
                    <h1 className="text-xl inter text-green-700">Free</h1>
                  </div>
                ) : (
                  <div className="flex ">
                    <IndianRupee className="w-6 h-6 mt-2 text-green-700" />
                    <span className="inter text-xl text-green-700 ml-1 mt-1">
                      {courseData?.pricing.amount}
                    </span>
                  </div>
                )}
                <div></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 mt-6">
                <div className="flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">{courseData?.language}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">{courseData?.level || "Level"}</span>
                </div>
                <div className="flex items-center">
                  <Book className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">
                    {courseData?.lessons.length} Lessons
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">
                    {courseData?.enrolledStudentsCount || "0"} Students
                  </span>
                </div>
              </div>
              {enrolled ? (
                <h1 className="text-green-800 font-bold mr-2">
                  Already enrolled
                </h1>
              ):(
                <button
                  className="w-full  sm:w-auto bg-black hover:bg-strong-rose text-white font-bold py-1 px-6 rounded-full"
                  onClick={() => handleEnrollment()}
                >
                  {courseData?.pricing.type === "free"
                    ? "Enroll Now"
                    : `Enroll for ₹${courseData?.pricing.amount}`}
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Instructor</h2>
              <div className="flex items-center ">
                <img
                  src={getInstructorData(courseData?.instructorRef, Need.PROFILE)?.toString()}
                  alt="Instructor"
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold mt-4">
                    {getInstructorData(courseData?.instructorRef, Need.NAME)?.toString()}
                  </h3>
                  <p className="text-gray-600 mb-4"></p>
                  <div className="flex space-x-2">
                    <button className="p-2 border bg-gray-200 rounded-full hover:bg-gray-100">
                      <Linkedin className="h-4 w-4" />
                    </button>
                    <button className="p-2 border bg-gray-200 rounded-full hover:bg-gray-100">
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button className="p-2 border bg-gray-200 rounded-full hover:bg-gray-100">
                      <Globe className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Course Trailer</h2>
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={trial || ""}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                  ></iframe>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Course Highlights</h3>
                <ul className="list-disc list-inside">
                  <li>Learn at your own pace</li>
                  <li>Access to exclusive resources</li>
                  <li>Certificate upon completion</li>
                  <li>24/7 support from instructors</li>
                </ul>
              </div>

              <div className="space-y-2">
                {courseData?.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden p-4 bg-white"
                  >
                    <span className="font-semibold">
                        Lesson {index + 1}: {lesson.title}
                      </span>
                    {openLesson === index && (
                      <div className="p-4 bg-white">
                        <div className="mb-4">
                          <div className="relative pb-[56.25%]">
                            <iframe
                              src={lesson.video || ""}
                              frameBorder="0"
                              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                            ></iframe>
                          </div>
                        </div>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-2">
                            Description
                          </h3>
                          <p className="text-sm text-gray-600">
                            {lesson.description}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Attachments
                          </h3>
                          {lesson.attachments &&
                          lesson.attachments.length > 0 ? (
                            <ul className="space-y-2">
                              {lesson.attachments.map((item, attachIndex) => (
                                <li
                                  key={attachIndex}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <Paperclip className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className="text-sm">
                                      {item.title}
                                    </span>
                                  </div>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-500 hover:text-blue-700"
                                  >
                                    <span className="text-sm mr-1">View</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No attachments for this lesson.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
    )}
   
    </>
  );
};

export default CourseDetails;

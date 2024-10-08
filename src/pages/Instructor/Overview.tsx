import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Text } from 'recharts';
import { getInstructorCourseDetailed, getInstructorsStudentsOverview } from '../../components/redux/slices/courseSlice';
import { getInstructorCoursesTransaction } from '../../components/redux/slices/paymentSlice';
import { AppDispatch, RootState } from '../../components/redux/store/store';
import DropDown from '../../components/common/Dropdown';
import { getAllUsers, StudentState } from '../../components/redux/slices/studentSlice';
import InstructorAnalyticsSkeleton from '../../components/skelton/InstructorOverview';
import Pagination from '../../components/common/Pagination';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomizedAxisTick = ({ x, y, payload }) => {

    const maxChars = 15; // Adjust this value based on your needs
    let displayName = payload.value;
    if (displayName.length > maxChars) {
        displayName = displayName.substring(0, maxChars) + '...';
    }
    return (
        <Text x={x} y={y} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
            {displayName}
        </Text>
    );
};

const InstructorOverview = () => {
    const [courseData, setCourseData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [studentsOverview, setStudentsOverview] = useState<string>(null)
    const [totalEnrollments,setTotalEnrollments] = useState <number>(0)
    const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [allUsers, setAllUSers] = useState<StudentState>([])
    const [totalPages, setTotalPages] = useState<number>(0)

    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
    
            setIsLoading(true);
    
            try {
                // Fetch courses data
                const coursesResponse = await dispatch(getInstructorCourseDetailed(user._id));
                const courses = coursesResponse.payload;
                
                if (courses.length === 0) {
                    throw new Error('You don/t have any uploaded courses. Please upload a course first.');
                }
    
                // Set default selected course ID if not already set
                if (!selectedCourseId) {
                    setSelectedCourseId(courses[0]._id);
                }
    
                // Calculate total enrollments across all courses
                const totalEnrollments = courses.reduce((acc, course) => acc + course.enrolledStudentsCount, 0);
                setTotalEnrollments(totalEnrollments);
    
                // Fetch payments data
                const paymentsResponse = await dispatch(getInstructorCoursesTransaction({
                    instructorId: user._id,
                    limit: 50,
                    page: currentPage
                }))
                
                const payments = paymentsResponse.payload.transactions;
                setTotalPages(paymentsResponse.payload.totalPages);
    
                // Combine course and payment data
                const combinedData = courses.map(course => {
                    console.log('course is>>>',course)
                    const coursePayments = payments.filter(payment => payment.courseId === course._id);
                    console.log('couyse paymebnts',coursePayments)
                    return {
                        id: course._id,
                        name: course.title,
                        studentsEnrolled: course.enrolledStudentsCount,
                        totalRevenue: coursePayments.reduce((sum, payment) => sum + (payment.instructorAmount / 100), 0),
                        instructorRevenue: coursePayments.reduce((sum, payment) => sum + (payment.instructorAmount / 100), 0),
                        averageRating: course.averageRating || 0,
                    };
                });
    
                setCourseData(combinedData);
    
            } catch (error) {
                setError(error.message);
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [dispatch, user?._id, selectedCourseId, currentPage]);
    

    useEffect(() => {
        // Define an async function inside useEffect
        const fetchStudentsData = async () => {
            if (user?._id && selectedCourseId) {
                try {
                    // Dispatch the async thunk and await the response
                    const resultAction = await dispatch(getInstructorsStudentsOverview({ instructorId: user._id, courseId: selectedCourseId }));

                    // Handle the result
                    if (getInstructorsStudentsOverview.fulfilled.match(resultAction)) {
                        const studentsData = resultAction.payload;
                        setStudentsOverview(studentsData[0])
                        const studentIds = studentsData[0].enrolledStudents.map(item => item.userId);
                        setEnrolledStudentIds(studentIds);

                    } else {
                        // Handle error case
                        console.error('Failed to fetch students data:', resultAction.payload);
                    }
                } catch (error) {
                    console.error('Error dispatching getInstructorsStudentsOverview:', error);
                }
            }
        };

        fetchStudentsData();
    }, [dispatch, user?._id, selectedCourseId]);

    useEffect(() => {
        dispatch(getAllUsers()).then(res => setAllUSers(res.payload))

    }, [])

    function getUser(userId: string) {
        const user = allUsers.find(data => data._id == userId)
        return user
    }

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) return <div className="text-center p-4"><InstructorAnalyticsSkeleton /></div>;

    const totalRevenue = courseData.reduce((sum, course) => sum + course.totalRevenue, 0);
    const averageRating = courseData.length > 0
        ? (courseData.reduce((sum, course) => sum + course.averageRating, 0) / courseData.length).toFixed(1)
        : 'N/A';

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Instructor Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {courseData.map((course, index) => (
                    <div key={index} className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
                        <p>Students Enrolled: {totalEnrollments}</p>
                        <p>Average Rating: {course.averageRating.toFixed(1)}</p>
                        <p className='mt-2'>
                            Revenue:
                            <span
                                className={`ml-2 text-md inter ${course.instructorRevenue === 0 ? 'text-red-600' : 'text-green-600'}`}
                            >
                                $ {course.instructorRevenue.toFixed(2)}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>
                <p>Total Students: {totalEnrollments}</p>
                <p>Average Rating: {averageRating}</p>
                <p className='mt-2'> Total Revenue: <span className='text-xl inter text-green-600'>$ {totalRevenue.toFixed(2)}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Students per Course</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={courseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick />} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="studentsEnrolled" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Revenue Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={courseData}
                                dataKey="totalRevenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label
                            >
                                {courseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="text-left p-2">Course Name</th>
                                <th className="text-left p-2">Students Enrolled</th>
                                <th className="text-left p-2">Total Revenue</th>
                                <th className="text-left p-2">Average Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseData.map((course, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                                    <td className="p-2">{course.name}</td>
                                    <td className="p-2">{course.studentsEnrolled}</td>
                                    <td className="p-2">${course.totalRevenue.toFixed(2)}</td>
                                    <td className="p-2">{course.averageRating.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mt-6">
                <div className='flex justify-between'>
                    <h2 className="text-xl font-semibold mb-4">Students Overview</h2>
                    <h2 className="text-xl font-semibold mb-4">{studentsOverview?.title}</h2>

                    <DropDown
                        text='Select Course'
                        data={courseData}
                        onSelect={(id) => setSelectedCourseId(id)}
                    />
                </div>
                {
                    studentsOverview && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left p-2">User</th>
                                        <th className="text-left p-2">Full Name</th>
                                        <th className="text-left p-2"> Score</th>
                                        <th className="text-left p-2">Total Score</th>
                                        <th className="text-left p-2">Attempts</th>
                                        <th className="text-left p-2">Exam Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsOverview.enrolledStudents.map((student, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                                            <td className="p-2">
                                                <div className="rounded-full w-10 h-10 shadow-sm border-2 border-gray-600 overflow-hidden">
                                                    <img
                                                        src={getUser(student.studentId).profile.avatar}
                                                        alt="avatar"
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2">{getUser(student.studentId).firstName + ' ' + getUser(student.studentId).lastName}</td>
                                            <td className="p-2">{student.score ? student.score : 'N/A'}</td>
                                            <td className="p-2">{studentsOverview.totalScore ? studentsOverview.totaLScore : 'N/A'}</td>
                                            <td className="p-2">{student.attempts ? student.attempts : 'N/A'}</td>
                                            <td className={`p-2 ${student.score === undefined ? 'text-gray-600' : student.score >= studentsOverview.totalScore ? 'text-green-700' : 'text-red-600'}`}>
                                                {student.score <= 0 ? 'No Assessment' : student.score >= studentsOverview.totalScore ? 'Passed' : 'Failed'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
                <div className="flex justify-end items-center p-6">
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        totalPages={totalPages}
                    />
                </div>
            </div>
        </div>
    );
};

export default InstructorOverview;
import React, { useState, useEffect } from 'react';
import {  Search, ArrowUpDown } from 'lucide-react';
import { getTransactions } from '../../components/redux/slices/paymentSlice';
import { AppDispatch, RootState } from '../../components/redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { User } from '../../types/user';
import { getAllUsers } from '../../components/redux/slices/studentSlice';
import CsvExporter from '../..//components/Admin/CsvExporter';
import Pagination from '../../components/common/Pagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getAllCourses } from '../../components/redux/slices/courseSlice';

const AdminTransaction = () => {
    const dispatch: AppDispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
    });
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [allCourses, setAllCourses] = useState<any[]>([]);
    
    useDocumentTitle('Transactions')

    useEffect(()=>{
        dispatch(getAllCourses({page:1})).then((res:any)=> setAllCourses(res.payload.courses))
    },[])
    useEffect(() => {
        if (allUsers.length <= 0) {
            dispatch(getAllUsers()).then((res) => {
                setAllUsers(res.payload)
            })
        }
    }, []);

    const { transactions,totalPages, loading, error } = useSelector((state: RootState) => state.payment);

    useEffect(() => {
        const fetchTransactions = () => {
            const params: Record<string, string> = {
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                ...filters,
            };

            // Remove empty filters
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            dispatch(getTransactions(params));
        };

        fetchTransactions();
    }, [dispatch, sortConfig, currentPage, itemsPerPage, searchTerm, filters]);

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };


    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getCourseName = (courseId: string) => {
        return allCourses?.find((course) => course._id == courseId)
    }

    const getUserName = (userId: string): string | null => {
        if (!allUsers) return null;
        const user = allUsers.find((user) => user._id === userId);
        return user ? `${user.firstName} ${user.lastName}` : null;
    };

    const filteredTransactions = transactions.filter((transaction) => {
        const lowerCaseSearchTerm = searchTerm?.toLowerCase() || "";

        const courseName = getCourseName(transaction.courseId)?.title?.toLowerCase() || "";
        const userName = getUserName(transaction.userId)?.toLocaleLowerCase() || "";
        const statusMatches = filters.status === "" || transaction.status.toLowerCase() === filters.status.toLowerCase();

        return (
            statusMatches &&
            (
                transaction.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                userName.includes(lowerCaseSearchTerm) ||
                courseName.includes(lowerCaseSearchTerm)
            )
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const csvData = filteredTransactions.map((transaction) => ({
        Payment_id: transaction.stripe_payment_intent_id,
        User: getUserName(transaction.userId) || 'Unknown User',
        Course: getCourseName(transaction.courseId)?.title,
        Amount: parseInt(transaction.amountInINR),
        Currency: transaction.currency,
        Status: transaction.status,
        Date: new Date(transaction.createdAt).toLocaleDateString(),
    }));

    const csvHeaders = [
        { label: 'Payment_id', key: 'Payment_id' },
        { label: 'User', key: 'User' },
        { label: 'Course', key: 'Course' },
        { label: 'Amount', key: 'Amount' },
        { label: 'Currency', key: 'Currency' },
        { label: 'Status', key: 'Status' },
        { label: 'Date', key: 'Date' },
    ];

    console.log('filtered transactiosn',filteredTransactions)
    console.log('all courses',allCourses)
    return (
        <div className="container mx-auto px-4 py-2">
            <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
            <div className="mb-4 flex flex-wrap justify-between items-center">
                <div className="relative mb-2 sm:mb-0">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <div className="flex flex-wrap items-center">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="mr-2 mb-2 sm:mb-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <CsvExporter data={csvData} filename="transactions" headers={csvHeaders} />
                </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
                <table className="border-collapse table-auto w-full whitespace-no-wrap bg-white table-striped relative">
                    <thead>
                        <tr className="text-left">
                            {['User', 'Course', 'Amount', 'Currency', 'Status', 'Date'].map((header) => (
                                <th key={header} className="bg-gray-100 sticky top-0 border-b border-gray-200 px-6 py-3 text-gray-600 font-bold tracking-wider uppercase text-xs">
                                    <button className="flex items-center" onClick={() => handleSort(header.toLowerCase())}>
                                        {header}
                                        <ArrowUpDown size={14} className="ml-1" />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4">Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-red-500">{error}</td>
                            </tr>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td className="border-t border-gray-200 px-6 py-4">
                                        {getUserName(transaction.userId)?.toLocaleUpperCase()}
                                    </td>
                                    <td className="border-t border-gray-200 px-6 py-4">{getCourseName(transaction.courseId)?.title}</td>
                                    <td className="border-t border-gray-200 px-6 py-4">{transaction.amountInINR}</td>
                                    <td className="border-t border-gray-200 px-6 py-4">{transaction.currency}</td>
                                    <td className="border-t border-gray-200 px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="border-t border-gray-200 px-6 py-4">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center items-center">
                {/* Add Pagination Component Here */}
                {totalPages > 1 && (
                    <div className="flex justify-end items-center p-6">
                        <Pagination
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            totalPages={totalPages}
                        />
                </div>
                )}
            </div>
        </div>
    );
};

export default AdminTransaction;
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Search, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);

        // Prefer RPC if available, but merge missing profile fields from profiles table.
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_users');

        let loadedUsers = [] as any[];
        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
            loadedUsers = rpcData as any[];

            // If RPC returned users without sex/dob, fill from profiles for the user IDs.
            const userIds = loadedUsers.map((u) => u.id).filter(Boolean);
            if (userIds.length) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, sex, dob')
                    .in('id', userIds as any[]);

                if (!profileError && profileData) {
                    const profileMap = Object.fromEntries(profileData.map((p: any) => [p.id, p]));
                    loadedUsers = loadedUsers.map((u) => ({
                        ...u,
                        sex: u.sex || profileMap[u.id]?.sex || '',
                        dob: u.dob || profileMap[u.id]?.dob || '',
                    }));
                }
            }
        }

        if (loadedUsers.length === 0) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
            } else {
                loadedUsers = data || [];
            }
        }

        setUsers(loadedUsers);
        setLoading(false);
    };

    const exportUsersToXls = () => {
        const headers = ['Name', 'Email', 'Phone', 'Gender', 'Date of Birth', 'Status', 'Joined'];
        const rows = filteredUsers.map(user => [
            `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            user.email || '',
            user.phone || '',
            getGender(user) === '-' ? '' : getGender(user),
            user.dob || user.date_of_birth || user.customer_info?.dob || user.user_metadata?.dob || '',
            user.email_confirmed_at ? 'Verified' : 'Pending',
            user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join('\t'))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().slice(0, 10)}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const getGender = (user: any) => {
        return (
            user.sex ||
            user.gender ||
            user.customer_info?.sex ||
            user.user_metadata?.gender ||
            '-'
        );
    };

    const getDob = (user: any) => {
        const dobValue = user.dob || user.date_of_birth || user.customer_info?.dob || user.user_metadata?.dob;
        return dobValue ? format(new Date(dobValue), 'MMM dd, yyyy') : '-';
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user.first_name?.toLowerCase() || '').includes(searchLower) ||
            (user.last_name?.toLowerCase() || '').includes(searchLower) ||
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.phone?.toLowerCase() || '').includes(searchLower)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-purple-900">Users</h2>
                <p className="text-muted-foreground">Manage your registered users.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Name, Email, or Phone..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={exportUsersToXls}>
                    Export XLS
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>DOB</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">Loading users...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback>
                                                    {user.first_name?.[0]}{user.last_name?.[0] || <User className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {user.first_name} {user.last_name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.email_confirmed_at ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>{getGender(user)}</TableCell>
                                        <TableCell>{getDob(user)}</TableCell>
                                        <TableCell>
                                            {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border rounded">
                <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(filteredUsers.length, currentPage * rowsPerPage)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-sm">Page {currentPage} / {totalPages}</span>
                    <button
                        className="px-3 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                    <select
                        className="border rounded p-1"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>
                </div>
            </div>

        </div>
    );
}

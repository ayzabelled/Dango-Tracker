'use client';
import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const FinancialTrackingForm: React.FC = () => {
    const { data: session, status } = useSession();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('cashIn');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Loading state

    const cashInCategories = [
        '💰 Salary',
        '💼 Business',
        '💸 Remittance',
        '🎁 Allowance',
        '📈 Investment',
        '💝 Gifts',
        '➕ Others'
    ];

    const cashOutCategories = [
        '🏠 Housing',
        '💡 Utilities',
        '🍎 Food',
        '🚌 Transportation',
        '📚 Education',
        '🩺 Healthcare',
        '🧴 Personal Care',
        '🛍️ Shopping',
        '🎬 Entertainment',
        '👨‍👩‍👧‍👦 Family & Friends',
        '💳 Debt Payments',
        '💸 Savings',
        '🙏 Donations',
        '➖ Others'
    ];

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated' || !session) {
            redirect('/'); // Redirect to login page if not authenticated
            return;
        }
    }, [status, session]);


    if (status === 'unauthenticated' || !session) {
        return null; // or <p>Redirecting...</p> if you want to show a brief message
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true)
        if (!session?.user?.id) {
            setError("User is not authenticated.");
            return;
        }

        const amountValue = type === 'Cash In' ? parseFloat(amount) : -parseFloat(amount); // Convert to number and handle sign

        try {
            const requestBody = {
                userId: session.user.id,
                amount: amountValue,
                category,
                type,
                date,
                time,
            };

            console.log("Request Body:", requestBody);

            const response = await fetch('/api/financial-tracker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    amount: amountValue,
                    category,
                    type,
                    date,
                    time,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create record');
            }

            console.log("Response data:", await response.json());

            setAmount('');
            setCategory('');
            setDate('');
            setTime('');
            setSuccessMessage('Entry created successfully!');
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating record:', err);
        } finally {
            setLoading(false); // Set loading to false when submission ends
        }
    };

    return (
        <>
            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <svg
                        className="animate-spin size-10 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z" />
                    </svg>
                </div>
            )}
            <div className='flex flex-col items-center p-4'>
                <h1 className='font-bold text-3xl pt-2 '>💸 Financial Tracker 💸</h1>
                <h2 className='text-xl pt-2 pb-4'>New Entry</h2>
                <form onSubmit={handleSubmit} className='border border-2 border-gray-500 p-4 rounded-md shadow-md grid grid-cols-3 gap-4 bg-[#F4F4F4] text-[#212121]'>
                    <div className='col-span-3 flex justify-center'>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    </div>
                    <div className='flex justify-center col-span-3'>
                        <RadioGroup defaultValue={type} className='flex flex-row justify-center' onValueChange={setType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Cash In" id="type-cashIn" />
                                <Label htmlFor="type-cashIn">Cash In</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Cash Out" id="type-cashOut" />
                                <Label htmlFor="type-cashOut">Cash Out</Label>
                            </div>
                        </RadioGroup>

                    </div>
                    <div className='col-span-3'>
                        <Input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className='[&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-3xl'
                            required
                        />
                    </div>
                    <div className='flex flex-row col-span-3 justify-center'>
                        <label htmlFor="amount" className='flex items-center text-gray-500 text-xs italic'>Amount</label>
                    </div>
                    <div className='flex items-center'>
                        <label htmlFor="category">Category:</label>
                    </div>
                    <div className='col-span-2'>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                            className='flex h-9 w-full rounded-md border border-[#6486DB] bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6486DB] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-3xl'
                        >
                            {type === 'cashIn'
                                ? cashInCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))
                                : cashOutCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                        </select>

                    </div>

                    <div>
                        <label htmlFor="date">Date:</label>
                    </div>
                    <div className='col-span-2'>
                        <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="time">Time:</label>
                    </div>
                    <div className='col-span-2'>
                        <Input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                    </div>
                    <div className='flex justify-center col-span-3'>
                        <Button type="submit" className='w-full bg-[#6486DB] text-white'>Submit</Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default function FinancialTrackingFormWrapper() {
    return (
        <SessionProvider>
            <FinancialTrackingForm />
        </SessionProvider>
    );
}
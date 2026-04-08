import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";

export default function Earnings() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("month");

  const weeklyData = [
    { week: "Week 1", earnings: 12500 },
    { week: "Week 2", earnings: 15200 },
    { week: "Week 3", earnings: 18900 },
    { week: "Week 4", earnings: 22400 },
  ];

  const transactions = [
    {
      id: "1",
      date: "Mar 28, 2026",
      description: "Weekly payout",
      amount: 22400,
      status: "completed",
      type: "credit",
    },
    {
      id: "2",
      date: "Mar 21, 2026",
      description: "Weekly payout",
      amount: 18900,
      status: "completed",
      type: "credit",
    },
    {
      id: "3",
      date: "Mar 15, 2026",
      description: "Platform fee",
      amount: 450,
      status: "completed",
      type: "debit",
    },
    {
      id: "4",
      date: "Mar 14, 2026",
      description: "Weekly payout",
      amount: 15200,
      status: "completed",
      type: "credit",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-b-[40px] p-6 pb-32">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-1">Earnings</h1>
        <p className="text-white/90">Track your income</p>
      </div>

      <div className="px-6 -mt-24 space-y-5">
        {/* Current Balance */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-gray-800">₹45,680</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
              💰
            </div>
          </div>

          <Button className="w-full py-6 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-xl text-lg">
            Withdraw to Bank
          </Button>
        </div>

        {/* This Month Summary */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">This Month</h3>
            <Calendar className="w-6 h-6" />
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold mb-2">₹1,24,560</p>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+24% from last month</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-400/30">
            <div>
              <p className="text-purple-100 text-xs mb-1">Orders</p>
              <p className="text-xl font-bold">486</p>
            </div>
            <div>
              <p className="text-purple-100 text-xs mb-1">Avg/Order</p>
              <p className="text-xl font-bold">₹256</p>
            </div>
            <div>
              <p className="text-purple-100 text-xs mb-1">Peak Day</p>
              <p className="text-sm font-bold">₹8.2k</p>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Weekly Breakdown</h3>
            <button className="text-sm text-green-600 font-medium">
              View Details
            </button>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Bar dataKey="earnings" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹3,68,540</p>
            <p className="text-sm text-gray-500 mt-1">Total Earned</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹256</p>
            <p className="text-sm text-gray-500 mt-1">Avg Per Order</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Transaction History</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "credit"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "credit" ? (
                      <span className="text-green-600">↓</span>
                    ) : (
                      <span className="text-red-600">↑</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount.toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5">
          <h3 className="font-bold text-gray-800 mb-3">💳 Payout Information</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Bank: HDFC Bank</p>
            <p>Account: ****1234</p>
            <p>Payout Schedule: Weekly (Every Monday)</p>
          </div>
          <button className="mt-3 text-sm text-blue-600 font-medium">
            Update Bank Details →
          </button>
        </div>
      </div>
    </div>
  );
}

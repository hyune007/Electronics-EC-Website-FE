import { useEffect, useState } from "react";
import "./Dashboard.css";
import {
    dashboardStats,
    revenueSummary,
    revenueByMonth
} from "../../../mocks/mockDashboard.js";

export default function Dashboard() {
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = revenueSummary.total;
        const duration = 1200; // ms
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setRevenue(Math.floor(start));
        }, stepTime);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard">
            {/* STATS */}
            <div className="stats-grid">
                {dashboardStats.map((s, i) => (
                    <div
                        key={i}
                        className="stat-card fade-up"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <p className="stat-title">{s.title}</p>
                        <h2>{s.value.toLocaleString()}</h2>
                    </div>
                ))}
            </div>

            {/* REVENUE */}
            <div className="revenue-section">
                <div className="revenue-card fade-up">
                    <p className="revenue-title">Tổng doanh thu</p>

                    <div className="revenue-value">
                        {revenue.toLocaleString()} ₫
                    </div>

                    <div className="revenue-note">
                        Cập nhật theo thời gian thực
                    </div>
                </div>

                {/* DOANH THU THEO THÁNG */}
                <div className="revenue-list fade-up">
                    <h3>Doanh thu theo tháng</h3>
                    <div className="month-scroll">
                        {revenueByMonth.map((m, i) => (
                            <div key={i} className="month-item">
                                <span>Tháng {m.month}</span>
                                <strong>{m.value.toLocaleString()} ₫</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

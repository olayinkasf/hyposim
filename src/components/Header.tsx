
import React from 'react';

export const Header: React.FC = () => {
    return (
        <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
                🏡 Berlin Owner-Occupier Cost & Equity Simulator (Live)
            </h1>
            <p className="text-lg text-gray-500 mb-8">
                Edit the values directly in the "Value" column to recalculate costs and long-term equity instantly.
            </p>
        </>
    );
};

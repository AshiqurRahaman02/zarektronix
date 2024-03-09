import React, { PureComponent } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";



export default function CustomPieChart({data}:any) {
	return (
		<PieChart width={500} height={250}>
			<Pie
				dataKey="totalAmount"
				isAnimationActive={false}
				data={data}
				cx="40%"
				cy="50%"
				outerRadius={80}
				fill="#8884d8"
				label
			/>
			<Tooltip />
		</PieChart>
	);
}

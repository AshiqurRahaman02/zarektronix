import React, { PureComponent } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";



export default function CustomPieChart({data}:any) {
	return (
		<PieChart width={500} height={250} 
		margin={{
			top: 0,
			right: 0,
			left: 0,
			bottom: 0,
		}}
		style={{margin:"auto", width:"100%"}}>
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

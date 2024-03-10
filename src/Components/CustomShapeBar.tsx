import React, { useEffect, useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from "recharts";

const colors = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"red",
	"rgb(255, 100, 126)",
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"red",
	"rgb(255, 100, 126)",
];

const getPath = (x: any, y: any, width: any, height: any) => {
	return `M${x},${y + height}C${x + width / 3},${y + height} ${
		x + width / 2
	},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
		x + width
	}, ${y + height}
  Z`;
};

const TriangleBar = (props: any) => {
	const { fill, x, y, width, height } = props;

	return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

export default function CustomShapeBar({ data }: any) {
	return (
		<BarChart
			width={1000}
			height={400}
			data={data}
			margin={{
				top: 0,
				right: 0,
				left: 0,
				bottom: 0,
			}}
			style={{ margin: "auto", width: "100%" }}
		>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="month" />
			<YAxis />
			<Bar
				dataKey="totalAmount"
				fill="#8884d8"
				shape={<TriangleBar />}
				label={{ position: "top" }}
			>
				{data.map((entry: any, index: any) => (
					<Cell key={`cell-${index}`} fill={colors[index % 20]} />
				))}
			</Bar>
		</BarChart>
	);
}

import React, { useState, useEffect } from "react";
import "./App.css";
import {
	MenuItem,
	FormControl,
	Select,
	Card,
	CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
	// STATE
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState("worldwide");
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
	const [mapZoom, setMapZoom] = useState(3);
	const [mapCountries, setMapCountries] = useState([]);
	const [casesType, setCasesType] = useState("cases");

	// api being called from - https://disease.sh/v3/covid-19/countries

	// Call Worldwide on load
	useEffect(() => {
		fetch("https://disease.sh/v3/covid-19/all")
			.then((response) => response.json())
			.then((data) => {
				setCountryInfo(data);
			});
	}, []);

	// USE EFFECT
	useEffect(() => {
		// async -> send request to the server
		const getCountriesData = async () => {
			await fetch("https://disease.sh/v3/covid-19/countries")
				.then((response) => response.json())
				.then((data) => {
					const countries = data.map((country) => ({
						name: country.country, // United Kingdom
						value: country.countryInfo.iso2, // UK
					}));
					const sortedData = sortData(data);
					setTableData(sortedData);
					setMapCountries(data);
					setCountries(countries);
				});
		};
		getCountriesData();
	}, []);

	const onCountryChange = async (event) => {
		const countryCode = event.target.value;

		// API urls
		const url =
			countryCode === "worldwide"
				? "https://disease.sh/v3/covid-19/all"
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;

		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				setCountry(countryCode);
				setCountryInfo(data);
				if (countryCode === "worldwide") {
					setMapCenter(mapCenter);
					setMapZoom(mapZoom);
				} else {
					setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
					setMapZoom(4);
				}
			});
	};

	return (
		<div className="app">
			{/* App Left */}
			<div className="app__left">
				{/* Header */}
				<div className="app__header">
					{/* Title and drop down field */}
					<h1>Covid 19 tracker</h1>
					<FormControl className="app__dropdown">
						<Select
							variant="outlined"
							onChange={onCountryChange}
							value={country}
						>
							<MenuItem value="worldwide">Worldwide</MenuItem>
							{/* Loop through countries and list in dropdown */}
							{countries.map((country) => (
								<MenuItem value={country.value}>{country.name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="app__stats">
					{/* Info boxes title="Coronavirus cases"*/}
					<InfoBox
						isRed
						active={casesType === "cases"}
						onClick={(e) => setCasesType("cases")}
						title="Coronavirus Cases"
						cases={prettyPrintStat(countryInfo.todayCases)}
						total={prettyPrintStat(countryInfo.cases)}
					/>
					{/* Info boxes title="Coronavirus recoveries"*/}
					<InfoBox
						active={casesType === "recovered"}
						onClick={(e) => setCasesType("recovered")}
						title="Coronavirus Recovered"
						cases={prettyPrintStat(countryInfo.todayRecovered)}
						total={prettyPrintStat(countryInfo.recovered)}
					/>
					{/* Info boxes title="Coronavirus deaths"*/}
					<InfoBox
						isRed
						active={casesType === "deaths"}
						onClick={(e) => setCasesType("deaths")}
						title="Coronavirus Deaths"
						cases={prettyPrintStat(countryInfo.todayDeaths)}
						total={prettyPrintStat(countryInfo.deaths)}
					/>
				</div>

				{/* Map */}
				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={mapZoom}
				/>
			</div>
			<Card className="app__right">
				<CardContent>
					<h3>Live cases by country</h3>
					{/* Table */}
					<Table countries={tableData} />
					<h3 className="app__rightGraphTitle">Worldwide new {casesType}</h3>
					{/* Graph*/}
					<LineGraph className="app__graph" casesType={casesType} />
				</CardContent>
			</Card>
		</div>
	);
}

export default App;

import { Init, d3Remove, d3, svgCheck } from '@saramin/ui-d3-helper';
import CLASS from '@saramin/ui-d3-selector';

const RadarChart = function(...arg) {

	const plugin = new Init(arg);
	let _this = {},
		targetNodes = _this.targetNodes = Init.setTarget(plugin),
		dataContainer = _this.dataContainer = Init.setData(plugin),
		options = _this.options = Init.setOptions(plugin, {
			w: 134,
			h: 134,
			factor: 1,
			maxValue: 100,
			levels: 5,
			factorLegend: 0.85,
			radians: 2 * Math.PI,
			translateX: 55,
			translateY: 40,
			extraWidthX: 100,
			extraWidthY: 100,
			labels: false,
			labelCurreny: '%',
			lablesPosition1: ['middle', '0px', '2px'],
			lablesPosition2: ['middle', '0px', '17px'],
			dotRadius: 3,
			dotType:['100 94, 104 104, 94 104'],
			checkMaxValue: null,
			wrapClass: `${CLASS.radarChartClass}`
		}),
		instances = _this.instances = [];

	Array.from(targetNodes).forEach(exec);


	function exec(el, i) {
		if(svgCheck.status) {
			let data = dataContainer[i];
			const radius = options.factor * Math.min(options.w / 2, options.h / 2);
			const keys = data[0].map(d => d.item);
			const total = keys.length;
			let dataValues = [];

			d3Remove(el);
			const g = d3.select(el)
				.append('svg')
				.classed(`${options.wrapClass}`, true)
				.attr('width', options.w + options.extraWidthX)
				.attr('height', options.h + options.extraWidthY)
				.attr('viewBox', `0 0 ${options.w + options.extraWidthX} ${options.h + options.extraWidthY}`)
				.append('g')
				.attr('transform', `translate(${options.translateX}, ${options.translateY})`);

			//Circular segments(방사형 선 갯수)
			for (let j = 0; j < options.levels; j++) {
				const levelFactor = options.factor * radius * ((j + 1) / options.levels);
				g.selectAll('.lines')
					.data(keys)
					.enter()
					.append('svg:line')
					.attr('x1', function (d, i) {
						return levelFactor * (1 - options.factor * Math.sin(i * options.radians / total));
					})
					.attr('y1', (d, i) => levelFactor * (1 - options.factor * Math.cos(i * options.radians / total)))
					.attr('x2', (d, i) => levelFactor * (1 - options.factor * Math.sin((i + 1) * options.radians / total)))
					.attr('y2', (d, i) => levelFactor * (1 - options.factor * Math.cos((i + 1) * options.radians / total)))
					.classed('line', true)
					.attr('transform', 'translate(' + (options.w / 2 - levelFactor) + ', ' + (options.h / 2 - levelFactor) + ')');
			}


			//Text indicating at what % each level is
			let series = 0;
			let axis;
			if(data.length > 1) {
				switch (options.checkMaxValue) {
					case "valueIntpolation":
						let realIdx = 0;
						data[0].forEach((item, idx) => {
							if(item['top'] === 'y') {
								realIdx = idx;
							}
						});
						axis = g.selectAll('.axis')
							.data(keys)
							.enter()
							.append('g')
							.attr('class', (d, i) => {
								if(i === realIdx) {
									return `axis axis${i} max`
								}else {
									return `axis axis${i}`
								}
							});
						break;
					case "firstMax":
						const maxValue = d3.max(data[1], d => d.value);
						const maxArray = data[1].map(item => item.value);
						const maxIdx = maxArray.indexOf(maxValue);

						axis = g.selectAll('.axis')
							.data(keys)
							.enter()
							.append('g')
							.attr('class', (d, i) => {
								if(i === maxIdx) {
									return `axis axis${i} max`
								}else {
									return `axis axis${i}`
								}
							});
						break;
					default:
						axis = g.selectAll('.axis')
							.data(keys)
							.enter()
							.append('g')
							.attr('class', (d, i) => `axis axis${i}`);
						break;
				}
			}else {
				axis = g.selectAll('.axis')
					.data(keys)
					.enter()
					.append('g')
					.attr('class', (d, i) => `axis axis${i}`);
			}




			// 가로 세로 기준선들
			axis.append('svg:line')
				.attr('x1', options.w / 2)
				.attr('y1', options.h / 2)
				.attr('x2', (d, i) => options.w / 2 * (1 - options.factor * Math.sin(i * options.radians / total)))
				.attr('y2', (d, i) => options.h / 2 * (1 - options.factor * Math.cos(i * options.radians / total)))
				.classed('line line_axis', true);


			axis.append('text')
				.classed(`${CLASS.legendItemValue}`, true)
				.text( d => d )
				.attr('text-anchor', options.lablesPosition1[0])
				.attr('dx', options.lablesPosition1[1])
				.attr('dy', options.lablesPosition1[2])
				.attr('x', (d, i) => options.w / 2 * (1 - options.factorLegend * Math.sin(i * options.radians / total)) - 45 * Math.sin(i * options.radians / total))
				.attr('y', (d, i) => options.h / 2 * (1- Math.cos(i*options.radians/total))- 17 * Math.cos(i*options.radians/total));

			// more 2 data && options.labels is true

			if(options.labels) {
				/*const datIdx = data.length === 1 ? 0 : 1; // data 갯수가 한개일경우 비교군이 없을경우*/
				let textArray = data[0].map(key => key.value);
				axis.append('text')
					.classed(`${CLASS.legendItemScore}`, true)
					.text(function(d,i) {
						return textArray[i] + options.labelCurreny;
					})
					.attr('text-anchor', options.lablesPosition2[0])
					.attr('dx', options.lablesPosition2[1])
					.attr('dy', options.lablesPosition2[2])
					.attr('x', (d, i) => options.w / 2 * (1 - options.factorLegend * Math.sin(i * options.radians / total)) - 45 * Math.sin(i * options.radians / total))
					.attr('y', (d, i) => options.h / 2 * (1- Math.cos(i*options.radians/total))- 18 * Math.cos(i*options.radians/total));
			}


			data.forEach(function (y, x) {
				dataValues = [];
				g.selectAll('.nodes')
					.data(y, function (j, i) {
						dataValues.push([
							options.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.sin(i * options.radians / total)),
							options.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.cos(i * options.radians / total))
						]);
					});

				dataValues.push(dataValues[0]);
				g.selectAll('.area')
					.data([dataValues])
					.enter()
					.append('polygon')
					.classed(`${CLASS.radarPolygon} ${CLASS.radarPolygon}0${series}`, true)
					.attr('points', function (d) {
						let str = '';
						for (let pti = 0; pti < d.length; pti++) {
							str = str + d[pti][0] + ',' + d[pti][1] + ' ';
						}
						return str;
					})
				series++;
			});

			series = 0;
			data.forEach(function (y, x) {
				if (series) {
					g.selectAll('.nodes')
						.data(y)
						.enter()
						.append('polygon')
						.classed(`${CLASS.radarPointer} ${CLASS.radarPointer}0${series}`, true)
						.attr('points', options.dotType[series])
						.attr('points', function (j, i) {
							dataValues.push([options.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.sin(i * options.radians / total)), options.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.cos(i * options.radians / total))]);
							const cx = options.w / 2 * (1 - (Math.max(j.value, 0) / options.maxValue) * options.factor * Math.sin(i * options.radians / total));
							const cy = options.h / 2 * (1 - (Math.max(j.value, 0) / options.maxValue) * options.factor * Math.cos(i * options.radians / total));
							return (cx + ' ' + (cy - 3) + ',' + (cx + 4) + ' ' + (cy + 4) + ',' + (cx - 4) + ' ' + (cy + 4));
						});
				} else {
					g.selectAll('.nodes')
						.data(y).enter()
						.append('svg:circle')
						.classed(`${CLASS.radarPointer} ${CLASS.radarPointer}0${series}`, true)
						.attr('cx', 100)
						.attr('cy', 100)
						.attr('r', options.dotRadius)
						.attr('cx', function (j, i) {
							dataValues.push([
								options.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.sin(i * options.radians / total)),
								options.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / options.maxValue) * options.factor * Math.cos(i * options.radians / total))
							]);
							return options.w / 2 * (1 - (Math.max(j.value, 0) / options.maxValue) * options.factor * Math.sin(i * options.radians / total));
						})
						.attr('cy', function (j, i) {
							return options.h / 2 * (1 - (Math.max(j.value, 0) / options.maxValue) * options.factor * Math.cos(i * options.radians / total));
						})
				}
				series++;
			});
		} else {
			el.innerHTML = '<p class="svg_not_supported">SVG를 지원하지 않는 브라우저입니다.</p>'
		}

	}
	return _this;

};


export default RadarChart;

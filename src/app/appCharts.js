import React, { Component, useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";


const currencySymbols = {
  'naira':'₦',
  'usd':'$'
}

const getMultipleSeries = ()=> {

}

const getYScale = (maxVal) =>{
  const scaleObject = {
    '0':{
      suffix:'',
      factor:1,
      interval:0,
      padding:0  //unit

    },
    '1':{
      suffix:'',
      factor:1,
      interval:1,
      padding:0  //unit

    },
    '2':{
      suffix:'',
      factor:1,
      interval:10,
      padding:9 //unit

    },
    '3':{
      suffix:'',
      factor:1,
      interval:100,
      padding:99 // 10's

    },
    '4':{
      suffix:'',
      factor:1,
      interval:1,
      padding:999 //100's

    },
    '5':{
      suffix:'',
      factor:1,
      interval:10,
      padding:9999 //1000's

    },
    '6':{
      suffix:'K',
      factor:3,
      interval:100,
      padding:99999 //10,000's


    },

    '7':{
      suffix:'M',
      factor:6,
      interval:1,
      padding:999999 //100,000's

    },

    '8':{
      suffix:'M',
      factor:6,
      interval:10,
      padding:9999999 //1,000,000's

    },

    '9':{
      suffix:'M',
      factor:6,
      interval:100,
      padding:99999999 //10,000,000's

    },
    '10':{
      suffix:'B',
      factor:9,
      interval:1,
      padding:999999999 //100,000,000's

    },
    '11':{
      suffix:'B',
      factor:9,
      interval:10,
      padding:9999999999 //1,000,000,000's

    },
    '12':{
      suffix:'B',
      factor:9,
      interval:100,
      padding:99999999999 //10,000,000,000's
    },
    '13':{
      suffix:'T',
      factor:12,
      interval:1,
      padding:999999999999 //100,000,000,000's
    },


  }
  const stringVal = maxVal.toString();
  const stringLength = stringVal.length;
  return scaleObject[stringLength.toString()];


}

const getMultipleChartForVersions = (graphData, graphColors) => {

  const yearsData = Object.keys(graphData);
  const maxPadding = 10000;
  const c_prefix = true ? 'usd':'naira';
  const yAxisObject = {
          type: 'value',
          axisLabel: {
              formatter: '{value}'
          },
          min: 0,
          max: 100000,
          interval: 25000,
          axisLine: {
              show: false
          },
          splitLine: {
              show: true,
              interval: 'auto'
          }
      }

  const series = [];
  const yAxisMaxArray = [];
  const legendData = [];

  yearsData.forEach((year, index)=>{
    const budgetData = graphData[year];
    budgetData.forEach((budgetBar, b_index)=>{

      const seriesObject =  {
              name: 'Online',
              data: [],
              label: { show: false, color: '#0168c1' },
              type: 'bar',
              barGap: 0,
              color: '#bcbbdd',
              smooth: true,
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowOffsetY: -2,
                      shadowColor: 'rgba(0, 0, 0, 0.3)'
                  }
              }
          }


      const { total_functional_currency, total_functional_naira } = budgetBar;

      let dataValue =  true ? total_functional_currency :  total_functional_naira; // using dollar values as default. make dynamic later

      seriesObject.data.push(dataValue.toFixed(2));
      yAxisMaxArray.push(Math.round(dataValue));


      const version = budgetBar.budgetversion.version_code;
      const {code, name} = version;
      const versionName = `${name} (${code})`;
      if(!legendData.includes(versionName)){
        legendData.push(versionName);
      }
      seriesObject.name = versionName;
      seriesObject.color = graphColors[b_index];
      series.push(seriesObject);
    });

    })

    let maxVal  = Math.round(Math.max(...yAxisMaxArray));
    const { suffix, factor, interval, padding } = getYScale(maxVal);
    yAxisObject.interval = interval;
     maxVal = (maxVal+padding)/(10**factor);
    yAxisObject.max = maxVal;
    yAxisObject.axisLabel.formatter= currencySymbols[c_prefix]+yAxisObject.axisLabel.formatter+suffix;

  return {
    legend: {
          borderRadius: 0,
          orient: 'horizontal',
          x: 'right',
          data: legendData
      },
      grid: {
          left: '8px',
          right: '8px',
          bottom: '0',
          containLabel: true
      },
      tooltip: {
          show: true,
          backgroundColor: 'rgba(0, 0, 0, .8)'
      },
      xAxis: [{
          type: 'category',
          data: yearsData,
          axisTick: {
              alignWithLabel: true
          },
          splitLine: {
              show: false
          },
          axisLine: {
              show: true
          }
      }],
      series,
      yAxis: [yAxisObject],
  }
}




const getMultipleEntityCategoryBarChart = (graphData, graphColors) => {
  const entitiesData = Object.keys(graphData);
  const maxPadding = 10000;


  console.log('graphData Data', graphData);


  const yAxis = {
      type: 'value',
      min: 0,
      max: 500,
      interval: 100,
      axisLabel: {
          formatter: '{value}',
          color: '#333',
          fontSize: 12,
          fontStyle: 'normal',
          fontWeight: 400
      },
      axisLine: {
          show: false,
          lineStyle: {
              color: '#ccc',
              width: 1
          }
      },
      axisTick: {
          show: false,
          lineStyle: {
              color: '#ccc',
              width: 1
          }
      },
      splitLine: {
          lineStyle: {
              color: '#ddd',
              width: 1,
              opacity: 0.5
          }
      }
  }






  const series = [];
  const yAxisMaxArray = [];

  entitiesData.forEach((entity, index)=>{
    const budgetData = graphData[entity];
    const entity_entries = `${entity}_ENTREIS`;
    let categoryNames = budgetData[entity_entries].map((entry)=>{
      const { category } = entry.costitem;
    return `${category.name} (${category.code})`
    });
     categoryNames = new Set(categoryNames);
    budgetData.forEach((budgetBar, b_index)=>{

      const seriesObject = {
          color: '#74c475',
          name: 'Steppe',
          type: 'bar',
          label: {
              normal: {
                  show: false,
                  position: 'insideBottom',
                  distance: 5,
                  align: 'left',
                  verticalAlign: 'middle',
                  rotate: 90,
                  formatter: '{c}  {name|{a}}',
                  fontSize: 14,
                  fontWeight: 'bold',
                  rich: {
                      name: {
                          color: '#fff',

                      }
                  }
              }
          },
          data: []
      }

      const { total_functional_currency, total_functional_naira } = budgetBar;

      const dataValue =  true ? total_functional_currency :  total_functional_naira; // using dollar values as default. make dynamic later

      seriesObject.data.push(dataValue);
      yAxisMaxArray.push(dataValue);


      const version = budgetBar.budgetversion.version_code;
      const {code, name} = version;
      const versionName = `${name} (${code})`;
      seriesObject.name = versionName;
      seriesObject.color = graphColors[b_index];
      series.push(seriesObject);
    });

    })

    let maxVal  = Math.round(Math.max(...yAxisMaxArray)) + maxPadding;
    const { suffix, factor, interval } = getYScale(maxVal);
    yAxis.interval = interval;
     maxVal = (maxVal/(10**factor));
    yAxis.max = maxVal;
    yAxis.axisLabel.formatter+=suffix;
    console.log('MAX VALUE', maxVal, 'Interval', interval);

    // min: 0,
    // max: 500,
    // interval: 100,

return {

  series,
  tooltip: {
      trigger: 'axis',
      axisPointer: {
          type: 'shadow'
      }
  },
  grid: {
      top: '8%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
  },
  yAxis,
  xAxis: {
      type: 'category',
      boundaryGap: true,
      data:yearsData,
      axisLabel: {
          formatter: '{value}',
          color: '#333',
          fontSize: 12,
          fontStyle: 'normal',
          fontWeight: 400,

      },
      axisLine: {
          show: false,
          lineStyle: {
              color: '#ccc',
              width: 1
          }
      },
      axisTick: {
          show: false,
          lineStyle: {
              color: '#ccc',
              width: 1
          }
      },
      splitLine: {
          show: false,
          lineStyle: {
              color: '#ccc',
              width: 1
          }
      }
  },


}


}

export const MultipleBarChart = (props)=> {

  const { chartData, colors, caller } = props;

  const optionObject = {
    department_versions:{
      method:getMultipleChartForVersions,
      style:{ height: "350px" }
    },
    entity_category:{
      method:getMultipleEntityCategoryBarChart,
      style:{ height: "150px" }
    }
  }

  const { method, style } = optionObject[caller];
  const option = method(chartData, colors);

  const graphProps = { option, style }


  return (
    <ReactEcharts
    {...graphProps}
    />
  )

}

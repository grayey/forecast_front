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

        const seriesData = [];

    budgetData.forEach((budgetBar, b_index)=>{
      const { total_functional_currency, total_functional_naira } = budgetBar;

      let dataValue =  true ? total_functional_currency :  total_functional_naira; // using dollar values as default. make dynamic later

      seriesData.push(dataValue.toFixed(2));
      yAxisMaxArray.push(Math.round(dataValue));

      const version = budgetBar.budgetversion.version_code;
      const {code, name} = version;
      const versionName = `${name} (${code})`;
      seriesObject.name = versionName;
      seriesObject.color = graphColors[b_index];

      // if(!legendData.includes(versionName)){ //  commented out because versions exist for other years
      legendData.push(versionName);


      // }

    });

    seriesObject.data = seriesData;

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

  const { summary, department } = graphData;
  const { itemcategories } = department;
  let categoryCodes = [];
  let categoryNames = [];
  let categoryLabels = [];
  const total_labels = [];
  const graphObjects = [];

  itemcategories.forEach((category)=>{
    const { name, code } = category;
    categoryCodes.push(code);
    categoryNames.push(name);
    categoryLabels.push(`${name} (${code})`);

  })



  const entitiesData = Object.keys(summary);
  console.log("ENTITIES DATTATTA", entitiesData)
  entitiesData.forEach((entity, index) => {
    const budgetData = summary[entity]; //eg PRINCIPAL
    const entity_entries = `${entity}_ENTRIES`;
    const category_label = `${entity}_LABELS`;
    const { total_in_currency, total_in_naira } = budgetData;
    const grand_total = true ? total_in_currency : total_in_naira;
    const total_label =  `${entity} TOTAL`;
    const total_code = `${entity}_TOTAL`;
    budgetData[category_label] = {};

    categoryCodes.push(total_code);
    categoryNames.push(entity);
    categoryLabels.push(total_label);
    total_labels.push(total_label);


    categoryCodes.forEach((code)=>{
      budgetData[category_label][code] = {
        total: code == total_code ? grand_total : 0,
        total_array:[]
      };
    })



    budgetData[entity_entries].forEach((budgetBar, b_index) => {

        const { category } = budgetBar.costitem;
        const { name, code } = category;
        const dataValue = true ? budgetBar.total_currency : budgetBar.total_naira; // default to dollar
        budgetData[category_label][code].total +=  dataValue;

    })

    const categoryKeys = Object.keys(budgetData[category_label]);
    console.log("CATEGORY KEYS :: ", categoryKeys, entity)
    const categoryKeysLength = categoryKeys.length;



    categoryKeys.forEach((key) => {
      const seriesValue = budgetData[category_label][key].total;
      budgetData[category_label][key].total_array.push(seriesValue.toFixed(2));
    });

    categoryCodes.forEach((code, c_index) =>{
      const label = categoryLabels[c_index];
      const seriesObject =  {
             name: label,
             data:budgetData[category_label][code].total_array,
             label: { show: false, color: '#0168c1' },
             type: 'bar',
             barGap: 0,
             color: graphColors[c_index],
             smooth: true,
             itemStyle: {
                 emphasis: {
                     shadowBlur: 10,
                     shadowOffsetX: 0,
                     shadowOffsetY: -2,
                     shadowColor: 'rgba(0, 0, 0, 0.3)'
                 }
             }
         };
         series.push(seriesObject);
         console.log("CATEGORY CODES CREATED CATEGORY KEYS",  category_label, budgetData[category_label])

         // budgetData[category_label][code].total_array = [];
    })
    yAxisMaxArray.push(grand_total);

    const cLength = categoryCodes.length;

// remove the appended '{entity} TOTAL' bar
    categoryCodes.splice(cLength-1,1);
    categoryNames.splice(cLength-1,1);
    categoryLabels.splice(cLength-1,1);


  });


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
          data: categoryLabels.concat(total_labels)
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
          data: entitiesData,
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

export const MultipleBarChart =  (props)=> {

  const { chartData, colors, caller } = props;

  const optionObject = {
    department_versions:{
      method:getMultipleChartForVersions,
      style:{ height: "400px" }
    },
    entity_category:{
      method:getMultipleEntityCategoryBarChart,
      style:{ height: "250px" }
    }
  }

  const { method, style } = optionObject[caller];
  const option =  method(chartData, colors);

  const graphProps = { option, style }


  return (
    <ReactEcharts
    {...graphProps}
    />
  )

}

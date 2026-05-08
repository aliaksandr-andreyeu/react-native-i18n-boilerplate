import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { testIDs } from '@/constants';

interface PieChartDataItem {
  color: string;
  percent: number;
  showPercent: number;
  angle: number;
}

interface BaseDonutChartProps {
  style?: ViewStyle | ViewStyle[];
  size: number;
  series: {
    percentage: number;
    color: string;
  }[];
  selected: number | undefined;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const gap = 0.025;
// const gap = 0;

const normalizeSeries2 = (
  data: {
    percentage: number;
    color: string;
  }[]
) => {
  const temp = data.slice();

  const percentageData = temp.map((el) => el.percentage);

  const total = percentageData.reduce((previous, percentage) => previous + percentage, 0);

  const minV = Math.min.apply(Math, percentageData);

  // console.log()

  temp.forEach((el) => {
    el.percentage -= minV;
  });
  const maxV = Math.max.apply(Math, percentageData);
  temp.forEach((el) => {
    el.percentage /= maxV - minV;
  });

  temp.forEach((el) => {
    el.percentage *= 100;
  });

  temp.forEach((el) => {
    el.percentage += 10;
  });

  return temp;
};

const normalizeSeries = (
  data: {
    percentage: number;
    color: string;
  }[]
) => {
  const temp = data.slice();

  const percentageData = temp.map((el) => el.percentage);

  const minV = Math.min.apply(Math, percentageData);

  // console.log('minV', minV);

  if (minV < 0) {
    temp.forEach((el) => {
      el.percentage += Math.abs(minV);
    });
  }

  // console.log('temp', temp);

  var total = temp.map((el) => el.percentage).reduce((a, v) => a + v);

  var inPercent = temp.map((v) => {
    return {
      color: v.color,
      percentage: Math.max((v.percentage / total) * 100, 3)
    };
  });

  return inPercent;

  // return temp;
};

// DIRTY CODE. TO CLEAN

const BaseDonutChart: FC<BaseDonutChartProps> = ({ style, selected, size = 250, series = [], ...rest }) => {
  const theme = useTheme();
  const {
    palette: { graphite }
  } = theme || {};

  const center = size / 2;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  if (!(series && Array.isArray(series) && series.length > 0)) {
    return (
      <View
        testID={testIDs.components.atoms.donutChart.first.container}
        style={[
          {
            overflow: 'hidden',
            // width: size + 20,
            // height: size + 20,

            width: size,
            height: size,

            alignItems: 'center',

            // padding: 10,
            borderRadius: size
            // borderWidth: 2
          },
          style
        ]}
      >
        <Svg testID={testIDs.components.atoms.donutChart.first.svg} width={size} height={size} x={0} y={0} viewBox={`0 0 ${size} ${size}`} fill={'none'}>
          <G testID={testIDs.components.atoms.donutChart.first.g} rotation={-90} originX={size / 2} originY={size / 2}>
            <Circle
              testID={testIDs.components.atoms.donutChart.first.circle}
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={graphite['100']}
              originX={center}
              originY={center}
              strokeDasharray={circumference}
            />
          </G>
        </Svg>
      </View>
    );
  }

  // console.log('@@@@@@@@@@@@@ series', series);

  const normalizedData = normalizeSeries(series);

  // console.log('@@@@@@@@@@@@@ normalizedData', normalizedData);

  // console.log('selected', selected);

  // const [selected, setSelected] = useState(undefined);
  /*
  series.forEach(({ percentage }) => {
    if (percentage < 0) {
      throw new Error(`Invalid series: all numbers should be positive. Found ${s}`);
    }
  });
*/

  const total = normalizedData.reduce((previous, { percentage }) => previous + percentage, 0);

  if (total <= 0) {
    throw new Error('Invalid series: sum of series is zero');
  }

  const data: PieChartDataItem[] = [];

  let angle = 0;

  /*  
  let temp = series;
  minV = Math.min.apply(Math, temp);;
for(var i=0; i<temp.length; i++) {temp[i] -= minV;}
maxV = Math.max.apply(Math, temp);;
for(var i=0; i<temp.length; i++) {temp[i] /= ( maxV - minV );}


  console.log('temp', temp);
*/

  normalizedData.forEach(({ percentage, color }, idx) => {
    // const percent = normalize(serie / (total || 1));
    const percent = percentage / (total || 1);
    // const percent = percentage / 100;

    let value = percent - gap;

    // console.log('value', value);
    // console.log('value', value);

    if (value <= 0) {
      // value = 0.1;
      // return;
    }

    let showPercent = normalizedData.length === 1 ? percent : value;

    data.push({
      percent,
      showPercent,
      color,
      angle
    });

    angle += percent * 360;
  });

  // const animatedStyle = useAnimatedStyle(() => {
  // const scale = withTiming(opened.current ? 0 : 1, { duration: 500 }, () => {
  // runOnJS(changeIsAnimating)(false);
  // });

  // anim.value = withTiming(opened.current ? 0 : 1, { duration: 500 }, () => {
  // runOnJS(changeIsAnimating)(false);
  // });

  // return {
  // transform: [{ scale: 1.1 }]
  // };
  // }, []);

  return (
    <View
      testID={testIDs.components.atoms.donutChart.second.container}
      style={[
        {
          overflow: 'hidden',
          // width: size + 20,
          // height: size + 20,

          width: size,
          height: size,

          alignItems: 'center',

          // padding: 10,
          borderRadius: size
          // borderWidth: 2
        },
        style
      ]}
    >
      <Svg testID={testIDs.components.atoms.donutChart.second.svg} width={size} height={size} x={0} y={0} viewBox={`0 0 ${size} ${size}`} fill={'none'}>
        {data.map(({ showPercent, color, angle }, idx, arr) => {
          let strokeDashoffset = circumference * (1 - showPercent);
          return (
            <G testID={testIDs.components.atoms.donutChart.second.g(idx)} key={idx} rotation={-90} originX={size / 2} originY={size / 2}>
              <AnimatedCircle
                testID={testIDs.components.atoms.donutChart.second.circle(idx)}
                cx={center}
                cy={center}
                r={radius}
                strokeWidth={strokeWidth}
                stroke={selected === undefined ? color : idx === selected ? color : graphite['100']}
                strokeLinecap={'round'}
                originX={center}
                originY={center}
                strokeDashoffset={strokeDashoffset}
                strokeDasharray={circumference}
                transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}

              // style={{

              // ...(idx === 1 && ({
              // transform: [{ scale: 1.5 }]
              // }) )

              // }}

              // hitSlop={8}
              // onPress={() => {
              // console.warn('onPress rect', idx, color);
              // setSelected(idx)
              // }}
              />
              {/*
              <Circle
                cx={center}
                cy={center}
                r={radius}
                strokeWidth={strokeWidth * 1.5}
                stroke={'transparent'}
                // stroke={idx === selected ? color : 'black'}
                // fill={'red'}
                strokeLinecap={'round'}
                originX={center}
                originY={center}
                strokeDashoffset={strokeDashoffset}
                strokeDasharray={circumference}
                transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
                // style={{

                // ...(idx === 1 && ({
                // transform: [{ scale: 1.5 }]
                // }) )

                // }}

                hitSlop={8}
                onPress={() => {
                  console.warn('onPress rect', idx, color);
                  setSelected(idx);
                }}
                onLongPress={() => {
                  console.warn('onLongPress rect', idx, color);
                  // setSelected(idx)
                }}
              />
              */}
            </G>
          );
        })}

        {/*
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2}
          // r={radius- strokeWidth}
          // strokeWidth={strokeWidth}
          // strokeLinecap={'round'}
          fill={'transparent'}
          // fill={'green'}
          originX={center}
          originY={center}
          // transform={`rotate(${angle}, ${size / 2}, ${size / 2})`}
          onPress={() => {
            console.warn('onPress MAIN');
          }}
          // hitSlop={4}
        />
        */}
      </Svg>
    </View>
  );
};

export default BaseDonutChart;

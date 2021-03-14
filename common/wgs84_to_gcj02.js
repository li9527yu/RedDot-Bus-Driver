// //wgs84_to_gcj02.js文件
 export function TransCj02(XL,YB) {
     var a = 6378245.0; // a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
     var ee = 0.00669342162296594323; // ee: 椭球的偏心率。
     var dLat = transformlat(XL - 105.0, YB - 35.0);
     var dLon = transformlng(XL - 105.0, YB - 35.0);
     var radLat = YB / 180.0 * Math.PI;
     var magic = Math.sin(radLat);
     magic = 1 - ee * magic * magic;
     var sqrtMagic = Math.sqrt(magic);
     dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
     dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
     
     var arraybdxy = new Array();
     arraybdxy = wgstogcj02(dLon, dLat);
     function wgstogcj02(dLon, dLat) {
         var mglat = YB + dLat;
         var mglng = XL + dLon;
         return [mglng, mglat]
     }
     var gdx = arraybdxy[0];
     var gdy = arraybdxy[1];
     return [gdx, gdy]
 }
  
 function transformlat(lng, lat) {
     var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
     ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
     ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
     ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
     return ret
 }
  
 function transformlng(lng, lat) {
     var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
     ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
     ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
     ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
     return ret
 }
// //地标 转 国测 常量
// var x_PI = (3.14159265358979324 * 3000.0) / 180.0;
// var PI = 3.1415926535897932384626;
// var a = 6378245.0; //卫星椭球坐标投影到平面地图坐标系的投影因子。  
// var ee = 0.00669342162296594323; //椭球的偏心率。
 
 
// //判断是否在国内，在中国国内的经纬度才需要做偏移
// function out_of_china(lng, lat) {
//     return (
//         lng < 72.004 ||
//         lng > 137.8347 ||
//         (lat < 0.8293 || lat > 55.8271 || false)
//     );
// }
 
// //转化经度
// function transformlng(lng, lat) {
//     var ret =
//         300.0 +
//         lng +
//         2.0 * lat +
//         0.1 * lng * lng +
//         0.1 * lng * lat +
//         0.1 * Math.sqrt(Math.abs(lng));
//     ret +=
//         ((20.0 * Math.sin(6.0 * lng * PI) +
//             20.0 * Math.sin(2.0 * lng * PI)) *
//             2.0) /
//         3.0;
//     ret +=
//         ((20.0 * Math.sin(lng * PI) +
//             40.0 * Math.sin((lng / 3.0) * PI)) *
//             2.0) /
//         3.0;
//     ret +=
//         ((150.0 * Math.sin((lng / 12.0) * PI) +
//             300.0 * Math.sin((lng / 30.0) * PI)) *
//             2.0) /
//         3.0;
//     return ret;
// }
 
// //转化纬度
// function transformlat(lng, lat) {
//     var ret =
//         -100.0 +
//         2.0 * lng +
//         3.0 * lat +
//         0.2 * lat * lat +
//         0.1 * lng * lat +
//         0.2 * Math.sqrt(Math.abs(lng));
//     ret +=
//         ((20.0 * Math.sin(6.0 * lng * PI) +
//             20.0 * Math.sin(2.0 * lng * PI)) *
//             2.0) /
//         3.0;
//     ret +=
//         ((20.0 * Math.sin(lat * PI) +
//             40.0 * Math.sin((lat / 3.0) * PI)) *
//             2.0) /
//         3.0;
//     ret +=
//         ((160.0 * Math.sin((lat / 12.0) * PI) +
//             320 * Math.sin((lat * PI) / 30.0)) *
//             2.0) /
//         3.0;
//     return ret;
// }
 
// //wgs84 to gcj02   地球坐标系 转 火星坐标系
// export function wgs84_to_gcj02(lng, lat) {
//     if (out_of_china(lng, lat)) {
//         return [lng, lat];
//     } else {
//         var dlat = transformlat(lng - 105.0, lat - 35.0);
//         var dlng = transformlng(lng - 105.0, lat - 35.0);
//         var radlat = (lat / 180.0) * PI;
//         var magic = Math.sin(radlat);
//         magic = 1 - ee * magic * magic;
//         var sqrtmagic = Math.sqrt(magic);
//         dlat =
//             (dlat * 180.0) /
//             (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
//         dlng =
//             (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
//         var mglat = lat + dlat;
//         var mglng = lng + dlng;
 
//         return [mglng, mglat];
//     }
// }
 
 
// //gcj02 to wgs84  火星坐标系 转 地球坐标系
// export function gcj02_to_wgs84(lng, lat) {
//     if (out_of_china(lng, lat)) {
//         return [lng, lat]
//     }
//     else {
//         var dlat = transformlat(lng - 105.0, lat - 35.0);
//         var dlng = transformlng(lng - 105.0, lat - 35.0);
//         var radlat = lat / 180.0 * PI;
//         var magic = Math.sin(radlat);
//         magic = 1 - ee * magic * magic;
//         var sqrtmagic = Math.sqrt(magic);
//         dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
//         dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
//         mglat = lat + dlat;
//         mglng = lng + dlng;
//         return [lng * 2 - mglng, lat * 2 - mglat]
//     }
// }
 
 
 
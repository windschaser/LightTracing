importScripts('utils.js');

function traceSingleColor(width, height, graphics, color, lightSource)
{
	let pixis = new Float64Array(width * height);
	for (let i = 0; i < width; i++)
	{
		for (let j = 0; j < height; j++)
		{
			let lights = lightSample(i, j, 60, 5, color);
			let powers = 0;
			for (let k = 0; k < lights.length; k++)
			{
				powers += trace(lights[k], lightSource, graphics, 0);
			}
			pixis[i * height + j] = powers / lights.length;
			//console.log(i + " " + j);
		}
	}
	return pixis.buffer;//返回像素数组
}

onmessage = function (e) {
	let result = traceSingleColor(...e.data);
	//let result=new ArrayBuffer(233);
	postMessage(result, [result]);
};
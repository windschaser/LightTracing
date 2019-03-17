/**
 * 判断点是否在圆内
 * @param point
 * @param circle
 * @returns {boolean}
 */
function isPointInCircle(point, circle)
{
	return (point.x - circle.point.x) ** 2 + (point.y - circle.point.y) ** 2 - circle.radius ** 2 < 0;
}

/**
 * 判断光线起点是否在任一物体内部
 * @param light
 * @param graphics
 * @returns {boolean}
 */
function isLightBeginInGraphics(light, graphics)
{
	for (let i = 0; i < graphics.length; i++)
	{
		if (isPointInCircle(light.start, graphics[i]))
			return true;
	}
	return false;
}

/**
 * 根据给定的坐标和精度进行光线采样
 * @param x
 * @param y
 * @param ds
 * @param rs
 * @param color
 * @returns {Array}
 */
function lightSample(x, y, ds, rs, color)
{
	ds = ds || 360;
	let dr = 360 / ds;
	rs = rs || 100;
	let lights = [];
	for (let i = 0; i < 360; i += dr)
	{
		for (let j = 0; j < rs; j++)
		{
			let degree = i + Math.random() * dr;
			let sin = Math.sin(Math.PI * 2 / 360 * degree);
			let cos = Math.cos(Math.PI * 2 / 360 * degree);
			lights.push({
				start: {x: x, y: y},
				vector: {x: cos, y: sin},
				color: color
			});
		}
	}
	return lights;//返回光线起点和角度
}

/**
 * 获取射线和圆的交点
 * @param cx
 * @param cy
 * @param r
 * @param stx
 * @param sty
 * @param edx
 * @param edy
 * @returns {null}
 */
function getPoint(cx, cy, r, stx, sty, edx, edy)
{
	// 求直线
	let k = (edy - sty) / (edx - stx);
	let b = edy - k * edx;
	//列方程
	let x1, y1, x2, y2;
	let c = cx * cx + (b - cy) * (b - cy) - r * r;
	let a = (1 + k * k);
	let b1 = (2 * cx - 2 * k * (b - cy));
	let tmp = b1 * b1 - 4 * a * c;
	let p = {};
	//console.log(tmp);
	if (tmp < 0)
	{
		return null;
	}
	else if (tmp == 0)
	{
		//一个交点
		tmp = Math.sqrt(tmp);
		p.x = (b1 + tmp) / (2 * a);
		p.y = k * x1 + b;
		if (((p.x - stx) / (edx - stx) > 0) && ((p.y - sty) / (edy - sty) > 0))
			return p;
		else
			return null;
	}
	else
	{
		tmp = Math.sqrt(tmp);
		//两个交点
		x1 = (b1 + tmp) / (2 * a);
		y1 = k * x1 + b;
		x2 = (b1 - tmp) / (2 * a);
		y2 = k * x2 + b;
		let d1 = Math.sqrt((y1 - sty) * (y1 - sty) + (x1 - stx) * (x1 - stx));
		let d2 = Math.sqrt((y2 - sty) * (y2 - sty) + (x2 - stx) * (x2 - stx));
		let d3 = Math.sqrt((sty - cy) * (sty - cy) + (stx - cx) * (stx - cx));
		if (d3 > r)
		{
			if (d1 < d2)
			{
				p.x = x1;
				p.y = y1;
			}
			else
			{
				p.x = x2;
				p.y = y2;
			}
			if (((p.x - stx) / (edx - stx) > 0) && ((p.y - sty) / (edy - sty) > 0))
				return p;
			else
				return null;
		}
		else
		{
			if (((x1 - stx) / (edx - stx) > 0) && ((y1 - sty) / (edy - sty) > 0))
			{
				p.x = x1;
				p.y = y1;
				return p;
			}
			else if (((x2 - stx) / (edx - stx) > 0) && ((y2 - sty) / (edy - sty) > 0))
			{
				p.x = x2;
				p.y = y2;
				return p;
			}
			else
				return null;
		}
		
	}
}

/**
 * 获取光线和图形的交点
 * @param light
 * @param graphic
 * @returns {*}
 */
function getIntersection(light, graphic)
{
	//console.log(light);
	cx = graphic.point.x;
	cy = graphic.point.y;
	r = graphic.radius;
	stx = light.start.x;
	sty = light.start.y;
	edx = stx + light.vector.x;
	edy = sty + light.vector.y;
	let s = getPoint(cx, cy, r, stx, sty, edx, edy);
	//console.log(s);
	//return null;
	if (!!s)
		return {x: s.x, y: s.y, graphic: graphic};//返回一个对象，字段包括坐标和物体对象
	else return s;
}

/**
 * 获取光线在交点处的反射光线
 * @param light
 * @param intersect
 * @returns {*[]}
 */
function getReflectionLights(light, intersect)
{
	let x1 = -light.vector.x;
	let y1 = -light.vector.y;
	
	let rx = intersect.graphic.point.x;
	let ry = intersect.graphic.point.y;
	
	let x0 = intersect.x;
	let y0 = intersect.y;
	
	let x2 = x0 - rx;
	let y2 = y0 - ry;
	
	let cos = (x1 * x2 + y1 * y2) / (Math.sqrt(x1 ** 2 + y1 ** 2) * Math.sqrt(x2 ** 2 + y2 ** 2));
	
	let flag = x1 * y2 - y1 * x2;
	let sin = Math.sqrt(1 - cos ** 2);
	if (flag < 0)
		sin = -sin;
	let result = [];
	result.push({
		start: {x: x0 + (x1 > 0 ? 0.01 : -0.01), y: y0 + (y1 > 0 ? 0.01 : -0.01)},
		vector: {x: x2 * cos - y2 * sin, y: x2 * sin + y2 * cos},
		ratio: intersect.graphic.reflect * 0.9,
		color: light.color
	});
	
	let refractionRatio = 0;
	switch (light.color)
	{
		case 0xff0000:
			refractionRatio = 1.5;
			break;
		case 0x00ff00:
			refractionRatio = 1.7;
			break;
		case 0x0000ff:
			refractionRatio = 1.9;
			break;
		default:
			refractionRatio = 1.5;
	}
	
	let refraction_sin = (isPointInCircle({
		x: x0 + (x1 > 0 ? -0.01 : 0.01),
		y: y0 + (y1 > 0 ? -0.01 : 0.01)
	}, intersect.graphic)) ? sin / refractionRatio : sin * refractionRatio;
	if (refraction_sin < 1)
	{
		let refraction_cos = -Math.sqrt(1 - refraction_sin ** 2);
		result.push({
			start: {x: x0 + (x1 > 0 ? -0.01 : 0.01), y: y0 + (y1 > 0 ? -0.01 : 0.01)},
			vector: {
				x: x2 * refraction_cos - y2 * refraction_sin,
				y: x2 * refraction_sin + y2 * refraction_cos
			},
			ratio: intersect.graphic.reflect * 0.9,
			color: light.color
		});
	}
	else result[0].ratio = intersect.graphic.reflect;
	
	return result;
	//和光线采样类似的返回
}
function trace(light, lightSource, graphics, deepth)
{
	let power = 0;
	let intersections = [];
	let firstIntersect = null;
	for (let i = 0; i < graphics.length; i++)
	{
		intersections.push(getIntersection(light, graphics[i]));
	}
	intersections = intersections.filter((value => !!value));
	if (intersections.length > 0)
		firstIntersect = intersections.sort((a, b) => {
			return (a.x - light.start.x) ** 2 + (a.y - light.start.y) ** 2 - (b.x - light.start.x) ** 2 - (b.y - light.start.y) ** 2
		})[0];
	/**
	 * 直接光照计算
	 */
	if (!isLightBeginInGraphics(light, graphics))
	{
		if (isPointInCircle(light.start, {...lightSource, radius: 100}))
			power += lightSource.power;//判断光线起点在光源内且不在物体内的情况
		else//判断和光源、物体的交点先后，得出是否有直接光照
		{
			let lightIntersect = getIntersection(light, {...lightSource, radius: 100});
			if (lightIntersect)
			{
				if (firstIntersect)
				{
					let d1 = (lightIntersect.x - light.start.x) ** 2 + (lightIntersect.y - light.start.y) ** 2;
					let d2 = (firstIntersect.x - light.start.x) ** 2 + (firstIntersect.y - light.start.y) ** 2;
					if (d1 < d2)
						power += lightSource.power;
				}
				else power += lightSource.power;
			}
		}
	}
	/**
	 * 间接光照计算
	 */
	if (firstIntersect && deepth < 5)
	{
		let reflectLights = getReflectionLights(light, firstIntersect);
		for (let i = 0; i < reflectLights.length; i++)
		{
			power += trace(reflectLights[i], lightSource, graphics, deepth + 1) * reflectLights[i].ratio;
		}
	}
	return power;
}
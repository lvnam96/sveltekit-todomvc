export const getStorage = () => globalThis.localStorage;

export const saveToStorage = (key: string, value: unknown) =>
	getStorage().setItem(
		key,
		JSON.stringify({
			type: typeof value,
			shouldParse: typeof value !== 'string',
			value
		})
	);

export const getFromStorage = (key: string) => {
	const string = getStorage().getItem(key);
	if (!string) return null;
	const { value } = JSON.parse(string);
	return value;
};

export const removeFromStorage = (key: string) => getStorage().removeItem(key);

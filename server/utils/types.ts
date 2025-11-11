enum ConnectionType {
	mysql = 'mysql',
	postgres = 'postgres'
};

type ConnectionCredentials = {
	connectionType: ConnectionType,
	host: string,
	port?: number,
	user: string,
	password: string,
	database?: string,
}

type User = {
	connectionType: ConnectionType,
	loginDate: string
}

type StorageValue = null | string | number | boolean | object;

export { ConnectionType, type ConnectionCredentials, type User, type StorageValue }
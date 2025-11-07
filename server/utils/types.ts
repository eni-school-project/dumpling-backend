enum ConnectionType { 'mysql', 'postgres' };

type User = {
	connectionType: ConnectionType,
	loginDate: string
}
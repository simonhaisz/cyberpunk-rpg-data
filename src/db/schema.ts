export type Schema = {
	name: string;
	tables: Table[];
};

export type Table = {
	name: string;
	columns: Column[];
};

export type Column = {
	name: string;
	type: ColumnType;
	key?: boolean;
	allowNull?: boolean;
	constraints?: string;
};

export enum ColumnType {
	Boolean = "boolean",
	Float = "float",
	Integer = "int",
	JSON = "json",
	String = "string",
	Text = "text"
}
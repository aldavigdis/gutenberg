export default function save( { attributes } ) {
	const { footnotes, order } = attributes;

	if ( ! order.length ) {
		return null;
	}

	return (
		<ol>
			{ order.map( ( id ) =>
				<li key={ id }>
					<a id={ id } href={ `#${ id }-anchor` }>^</a>
					{ footnotes[ id ] }
				</li>
			) }
		</ol>
	);
}

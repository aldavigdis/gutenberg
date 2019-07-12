/**
 * External dependencies
 */
import uuid from 'uuid/v4';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { removeFormat, isCollapsed, insertObject, applyFormat } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';

const name = 'core/note';
const title = __( 'Note' );

export const note = {
	name,
	title,
	tagName: 'a',
	className: 'note-anchor',
	attributes: {
		href: 'href',
		id: 'id',
	},
	edit: class NoteEdit extends Component {
		constructor() {
			super( ...arguments );

			this.add = this.add.bind( this );
			this.remove = this.remove.bind( this );
		}

		add() {
			const { value, onChange } = this.props;
			const id = uuid();
			const format = {
				type: name,
				attributes: {
					// It does not matter what this is, as long as it is unique per
					// page.
					href: `#${ id }`,
					id: `${ id }-anchor`,
					'data-note': id,
				},
			};

			let newValue;

			if ( isCollapsed( value ) ) {
				const prevStart = value.start;
				newValue = insertObject( value, format );
				newValue.start = prevStart;
			} else {
				newValue = applyFormat( value, format );
			}

			onChange( newValue );
		}

		remove() {
			const { value, onChange } = this.props;

			onChange( removeFormat( value, name ) );
		}

		render() {
			const { isActive } = this.props;

			return (
				<Fragment>
					<RichTextToolbarButton
						icon="editor-ol"
						title={ title }
						onClick={ isActive ? this.remove : this.add }
						isActive={ isActive }
					/>
				</Fragment>
			);
		}
	},
};

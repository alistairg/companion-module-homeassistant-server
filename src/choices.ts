import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	DropdownChoice,
} from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { MediaPlayback, MuteToggle, OnOffToggle } from './util.js'

export const LIGHT_MAX_BRIGHTNESS = 255

export function OnOffTogglePicker(): CompanionInputFieldDropdown<'state'> {
	const options = [
		{ id: OnOffToggle.On, label: 'On' },
		{ id: OnOffToggle.Off, label: 'Off' },
		{ id: OnOffToggle.Toggle, label: 'Toggle' },
	]
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: OnOffToggle.On,
		choices: options,
		disableAutoExpression: true,
	}
}

export function OnOffPicker(): CompanionInputFieldCheckbox<'state'> {
	return {
		type: 'checkbox',
		label: 'State',
		id: 'state',
		default: true,
	}
}

export function MediaPlaybackPicker(): CompanionInputFieldDropdown<'action'> {
	const options = [
		{ id: MediaPlayback.Play, label: 'Play' },
		{ id: MediaPlayback.Pause, label: 'Pause' },
		{ id: MediaPlayback.PlayPause, label: 'Play / Pause (toggle)' },
		{ id: MediaPlayback.Stop, label: 'Stop' },
	]
	return {
		type: 'dropdown',
		label: 'Action',
		id: 'action',
		default: MediaPlayback.PlayPause,
		choices: options,
		disableAutoExpression: true,
	}
}

export function MediaMutePicker(): CompanionInputFieldDropdown<'state'> {
	const options = [
		{ id: MuteToggle.Mute, label: 'Mute' },
		{ id: MuteToggle.Unmute, label: 'Unmute' },
		{ id: MuteToggle.Toggle, label: 'Toggle' },
	]
	return {
		type: 'dropdown',
		label: 'Action',
		id: 'state',
		default: MuteToggle.Mute,
		choices: options,
		disableAutoExpression: true,
	}
}

// Common media_player states. Entities may report others, so custom values are allowed.
export const MEDIA_PLAYER_STATES = ['playing', 'paused', 'idle', 'buffering', 'on', 'off', 'standby']

export function MediaPlaybackStatePicker(): CompanionInputFieldDropdown<'state'> {
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: 'playing',
		choices: MEDIA_PLAYER_STATES.map((state) => ({ id: state, label: state })),
		allowCustom: true,
	}
}

function EntityOptions(state: HassEntity[], prefix: string | undefined): DropdownChoice<string>[] {
	const entities = state.filter((ent) => prefix === undefined || ent.entity_id.indexOf(`${prefix}.`) === 0)

	return entities
		.map((ent) => ({
			id: ent.entity_id,
			label: ent.attributes.friendly_name || ent.entity_id,
		}))
		.sort((a, b) => {
			const a2 = a.label.toLowerCase()
			const b2 = b.label.toLowerCase()
			return a2 === b2 ? 0 : a2 < b2 ? -1 : 1
		})
}

export function EntityPicker(
	state: HassEntity[],
	prefix: string | undefined,
): CompanionInputFieldDropdown<'entity_id', string> {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'dropdown',
		label: 'Entity',
		id: 'entity_id',
		default: choices[0]?.id ?? '',
		choices: choices,
	}
}

export function EntityMultiplePicker(
	state: HassEntity[],
	prefix: string | undefined,
): CompanionInputFieldMultiDropdown<'entity_id'> {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'multidropdown',
		label: 'Entities',
		id: 'entity_id',
		default: [],
		choices: choices,
	}
}

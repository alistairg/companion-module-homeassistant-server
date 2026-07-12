import {
	callService,
	type Connection,
	type HassEntity,
	type HassServices,
	type HassServiceTarget,
} from 'home-assistant-js-websocket'
import type { CompanionActionEvent, CompanionActionDefinitions, DropdownChoice } from '@companion-module/base'
import { EntityMultiplePicker, MediaMutePicker, MediaPlaybackPicker, OnOffTogglePicker } from './choices.js'
import { MediaPlayback, MuteToggle, OnOffToggle } from './util.js'

export type ActionsSchema = {
	set_switch: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_input_boolean: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_light_on: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	set_light_pct: {
		options: {
			entity_id: string[]
			pct: number
		}
	}
	adj_light_pct: {
		options: {
			entity_id: string[]
			pct: number
		}
	}
	execute_script: {
		options: {
			entity_id: string[]
		}
	}
	press_button: {
		options: {
			entity_id: string[]
		}
	}
	activate_scene: {
		options: {
			entity_id: string[]
		}
	}
	input_select_first: {
		options: {
			entity_id: string[]
		}
	}
	input_select_last: {
		options: {
			entity_id: string[]
		}
	}
	input_select_next: {
		options: {
			entity_id: string[]
		}
	}
	input_select_previous: {
		options: {
			entity_id: string[]
		}
	}
	input_select_set: {
		options: {
			entity_id: string[]
			option: string
		}
	}
	set_group_on: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	media_set_playback: {
		options: {
			entity_id: string[]
			action: MediaPlayback
		}
	}
	media_next_track: {
		options: {
			entity_id: string[]
		}
	}
	media_previous_track: {
		options: {
			entity_id: string[]
		}
	}
	media_set_mute: {
		options: {
			entity_id: string[]
			state: MuteToggle
		}
	}
	media_volume_up: {
		options: {
			entity_id: string[]
		}
	}
	media_volume_down: {
		options: {
			entity_id: string[]
		}
	}
	media_set_volume: {
		options: {
			entity_id: string[]
			volume: number
		}
	}
	media_volume_adjust: {
		options: {
			entity_id: string[]
			delta: number
		}
	}
	media_set_power: {
		options: {
			entity_id: string[]
			state: OnOffToggle
		}
	}
	call_service: {
		options: {
			entity_id: string[]
			service: string
			payload: string
		}
	}
}

export function GetActionsList(
	getProps: () => { state: HassEntity[]; services: HassServices; client: Connection | undefined },
): CompanionActionDefinitions<ActionsSchema> {
	const entityOnOff = async (opt: CompanionActionEvent['options']): Promise<void> => {
		const { client } = getProps()
		if (!client) return

		let service: string
		switch (opt.state as OnOffToggle) {
			case OnOffToggle.Off:
				service = 'turn_off'
				break
			case OnOffToggle.Toggle:
				service = 'toggle'
				break
			default:
				service = 'turn_on'
				break
		}

		await callService(client, 'homeassistant', service, {
			entity_id: opt.entity_id,
		})
	}

	const { state: initialState, services: initialServices } = getProps()
	const pickerLights = EntityMultiplePicker(initialState, 'light')

	const serviceChoices: DropdownChoice[] = []
	for (const [domain, services] of Object.entries(initialServices)) {
		for (const [service, props] of Object.entries(services)) {
			const id = `${domain}.${service}`
			serviceChoices.push({
				id: id,
				label: props.name ? `${domain}: ${props.name}` : id,
			})
		}
	}

	const actions: CompanionActionDefinitions<ActionsSchema> = {
		set_switch: {
			name: 'Set switch state',
			options: [EntityMultiplePicker(initialState, 'switch'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_input_boolean: {
			name: 'Set input_boolean state',
			options: [EntityMultiplePicker(initialState, 'input_boolean'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_light_on: {
			name: 'Set light on/off state',
			options: [pickerLights, OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		set_light_pct: {
			name: 'Set light brightness (percentage)',
			options: [
				pickerLights,
				{
					type: 'number',
					label: 'Brightness',
					id: 'pct',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
					range: true,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'light', 'turn_on', {
					entity_id: evt.options.entity_id,
					brightness_pct: Number(evt.options.pct),
				})
			},
		},
		adj_light_pct: {
			name: 'Adjust light brightness (percentage)',
			options: [
				pickerLights,
				{
					type: 'number',
					label: 'Adjustment',
					id: 'pct',
					default: 1,
					min: -100,
					max: 100,
					step: 1,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'light', 'turn_on', {
					entity_id: evt.options.entity_id,
					brightness_step_pct: Number(evt.options.pct),
				})
			},
		},
		execute_script: {
			name: 'Execute script',
			options: [EntityMultiplePicker(initialState, 'script')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'homeassistant', 'turn_on', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		press_button: {
			name: 'Press button',
			options: [EntityMultiplePicker(initialState, 'button')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'button', 'press', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		activate_scene: {
			name: 'Activate scene',
			options: [EntityMultiplePicker(initialState, 'scene')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'scene', 'turn_on', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_first: {
			name: 'Input Select: First',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_first', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_last: {
			name: 'Input Select: Last',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_last', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_next: {
			name: 'Input Select: Next',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_next', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_previous: {
			name: 'Input Select: Previous',
			options: [EntityMultiplePicker(initialState, 'input_select')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_previous', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		input_select_set: {
			name: 'Input Select: Select',
			options: [
				EntityMultiplePicker(initialState, 'input_select'),
				{
					type: 'textinput',
					id: 'option',
					default: '',
					label: 'Option',
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'input_select', 'select_option', {
					entity_id: evt.options.entity_id,
					option: evt.options.option,
				})
			},
		},
		set_group_on: {
			name: 'Set group on/off state',
			options: [EntityMultiplePicker(initialState, 'group'), OnOffTogglePicker()],
			callback: async (evt) => entityOnOff(evt.options),
		},
		media_set_playback: {
			name: 'Media: Set playback',
			options: [EntityMultiplePicker(initialState, 'media_player'), MediaPlaybackPicker()],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				let service: string
				switch (evt.options.action) {
					case MediaPlayback.Play:
						service = 'media_play'
						break
					case MediaPlayback.Pause:
						service = 'media_pause'
						break
					case MediaPlayback.Stop:
						service = 'media_stop'
						break
					default:
						service = 'media_play_pause'
						break
				}

				await callService(client, 'media_player', service, {
					entity_id: evt.options.entity_id,
				})
			},
		},
		media_next_track: {
			name: 'Media: Next track',
			options: [EntityMultiplePicker(initialState, 'media_player')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'media_player', 'media_next_track', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		media_previous_track: {
			name: 'Media: Previous track',
			options: [EntityMultiplePicker(initialState, 'media_player')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'media_player', 'media_previous_track', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		media_set_mute: {
			name: 'Media: Set mute',
			options: [EntityMultiplePicker(initialState, 'media_player'), MediaMutePicker()],
			callback: async (evt) => {
				const { client, state } = getProps()
				if (!client) return

				const mode = evt.options.state
				for (const entityId of evt.options.entity_id) {
					let muted: boolean
					if (mode === MuteToggle.Toggle) {
						// media_player has no mute toggle service, so invert the current mute state
						const entity = state.find((ent) => ent.entity_id === entityId)
						muted = !(entity?.attributes.is_volume_muted ?? false)
					} else {
						muted = mode === MuteToggle.Mute
					}

					await callService(client, 'media_player', 'volume_mute', {
						entity_id: entityId,
						is_volume_muted: muted,
					})
				}
			},
		},
		media_volume_up: {
			name: 'Media: Volume up',
			options: [EntityMultiplePicker(initialState, 'media_player')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'media_player', 'volume_up', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		media_volume_down: {
			name: 'Media: Volume down',
			options: [EntityMultiplePicker(initialState, 'media_player')],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				await callService(client, 'media_player', 'volume_down', {
					entity_id: evt.options.entity_id,
				})
			},
		},
		media_set_volume: {
			name: 'Media: Set volume (percentage)',
			options: [
				EntityMultiplePicker(initialState, 'media_player'),
				{
					type: 'number',
					label: 'Volume (0 = min, 100 = max)',
					id: 'volume',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
					range: true,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				const level = Math.min(1, Math.max(0, Number(evt.options.volume) / 100))
				await callService(client, 'media_player', 'volume_set', {
					entity_id: evt.options.entity_id,
					volume_level: level,
				})
			},
		},
		media_volume_adjust: {
			name: 'Media: Adjust volume by amount (percentage)',
			options: [
				EntityMultiplePicker(initialState, 'media_player'),
				{
					type: 'number',
					label: 'Adjustment (percentage points, added to the current volume)',
					id: 'delta',
					default: 5,
					min: -100,
					max: 100,
					step: 1,
				},
			],
			callback: async (evt) => {
				const { client, state } = getProps()
				if (!client) return

				const delta = Number(evt.options.delta) / 100
				for (const entityId of evt.options.entity_id) {
					const entity = state.find((ent) => ent.entity_id === entityId)
					if (!entity) continue

					const current = Number(entity.attributes.volume_level)
					if (!Number.isFinite(current)) continue

					const next = Math.min(1, Math.max(0, current + delta))
					await callService(client, 'media_player', 'volume_set', {
						entity_id: entityId,
						volume_level: next,
					})
				}
			},
		},
		media_set_power: {
			name: 'Media: Set power',
			options: [EntityMultiplePicker(initialState, 'media_player'), OnOffTogglePicker()],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				let service: string
				switch (evt.options.state) {
					case OnOffToggle.On:
						service = 'turn_on'
						break
					case OnOffToggle.Off:
						service = 'turn_off'
						break
					default:
						service = 'toggle'
						break
				}

				await callService(client, 'media_player', service, {
					entity_id: evt.options.entity_id,
				})
			},
		},
		call_service: {
			name: 'Call Service',
			description: 'Please open a feature request, so that useful things are properly supported',
			options: [
				EntityMultiplePicker(initialState, undefined),
				{
					id: 'service',
					label: 'Service',
					type: 'dropdown',
					default: serviceChoices[0]?.id,
					choices: serviceChoices,
					allowCustom: true,
				},
				{
					type: 'textinput',
					id: 'payload',
					tooltip: 'Must be valid JSON!',
					default: '{ "option": "value" }',
					label: 'Payload',
					useVariables: true,
				},
			],
			callback: async (evt) => {
				const { client } = getProps()
				if (!client) return

				try {
					const payload = JSON.parse(evt.options.payload)

					// Split the domain off of the service name
					const [domain, service] = `${evt.options.service}`.split('.', 2)
					const serviceDefinition = initialServices[domain][service]

					const target: HassServiceTarget = {}

					const selectedEntities = evt.options.entity_id
					if (selectedEntities.length > 0) {
						if (serviceDefinition.fields.entity_id) {
							const entityIdSelector = serviceDefinition.fields.entity_id.selector as any | undefined
							const selectorSupportsMultipleEntities = entityIdSelector?.entity?.multiple

							if (selectedEntities.length > 1 && !selectorSupportsMultipleEntities) {
								throw new Error(`The service ${evt.options.service} only supports a single entity_id`)
							}

							payload.entity_id = selectorSupportsMultipleEntities ? selectedEntities : selectedEntities[0]
						}

						if (serviceDefinition.target) {
							target.entity_id = selectedEntities
						}
					}

					await callService(client, domain, service, payload, target)
				} catch (e) {
					console.debug(`Call service failed: ${e}`)
				}
			},
		},
	}

	return actions
}

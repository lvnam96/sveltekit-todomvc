<script lang="ts">
	import { browser } from '$app/environment';
	import { getFromStorage, removeFromStorage, saveToStorage } from '../services/storage';

	const ENTER_KEY = 'Enter';
	const ESCAPE_KEY = 'Escape';
	let currentFilter = 'all';
	let items: TodoItem[] = [];
	let editing: TodoItem['id'] | null = null;

	if (browser) {
		// grab data from local storage
		try {
			const savedItems = getFromStorage('todos');
			if (!Array.isArray(savedItems)) removeFromStorage('todos');
			items = savedItems || [];
		} catch (err) {
			items = [];
		}

		// handle hash change
		const onHashChange = () => {
			if (globalThis.location.hash === '#/active') {
				currentFilter = 'active';
			} else if (globalThis.location.hash === '#/completed') {
				currentFilter = 'completed';
			} else currentFilter = 'all';
		};
		globalThis.addEventListener('hashchange', onHashChange);
		onHashChange();
	}

	const onKeydownInputCreateItem = (e: KeyboardEvent) => {
		if (e.key === ENTER_KEY && (e.target as HTMLInputElement).value.trim()) {
			items = items.concat({
				id: uuid(),
				description: (e.target as HTMLInputElement).value,
				completed: false
			});
			(e.target as HTMLInputElement).value = '';
		} else if (e.key === ESCAPE_KEY) {
			(e.target as HTMLInputElement).value = '';
		}
	};

	const onClickClearCompleted = () => {
		items = items.filter((item) => !item.completed);
	};

	const onChangeToggleAll = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const checked = (e.target as HTMLInputElement).checked;
		items = items.map((item) => ({ ...item, completed: checked }));
	};

	const handleEditItem = (itemId: TodoItem['id']) => {
		editing = itemId;
	};

	const handleRemoveItem = (itemId: TodoItem['id']) => {
		items = items.filter((item) => item.id !== itemId);
	};

	const onKeydownInputEditItem = (e: KeyboardEvent) => {
		if (e.key === ENTER_KEY && (e.target as HTMLInputElement).value.trim()) {
			items = items.map((item) =>
				item.id === editing ? { ...item, description: (e.target as HTMLInputElement).value } : item
			);
			editing = null;
		} else if (e.key === ESCAPE_KEY) {
			editing = null;
		}
	};

	const handleChangeCheckboxComplete = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		itemId: TodoItem['id']
	) => {
		const checked = (e.target as HTMLInputElement).checked;
		items = items.map((item) => (item.id === itemId ? { ...item, completed: checked } : item));
	};

	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	$: filteredItems = items.filter((item) => {
		if (currentFilter === 'active') {
			return !item.completed;
		} else if (currentFilter === 'completed') {
			return item.completed;
		}
		return true;
	});
	$: numCompleted = items.filter((item) => item.completed).length;
	$: numActive = items.length - numCompleted;

	// save data to local storage
	$: try {
		if (browser) saveToStorage('todos', items);
	} catch (err) {
		console.error(err);
	}

	interface TodoItem {
		id: string;
		description: string;
		completed: boolean;
	}
</script>

<section class="todoapp">
	<header class="header">
		<h1>todos</h1>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			class="new-todo"
			placeholder="What needs to be done?"
			autofocus
			on:keydown={onKeydownInputCreateItem}
		/>
	</header>
	<!-- This section should be hidden by default and shown when there are todos -->
	<section class="main">
		<input
			id="toggle-all"
			class="toggle-all"
			type="checkbox"
			on:change={onChangeToggleAll}
			checked={numCompleted === items.length}
		/>
		<label for="toggle-all">Mark all as complete</label>
		<ul class="todo-list">
			<!-- These are here just to show the structure of the list items -->
			<!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
			{#each filteredItems as item (item.id)}
				<li class="{item.completed ? 'completed' : ''} {editing === item.id ? 'editing' : ''}">
					<div class="view">
						<input
							id="item-{item.id}-checkbox"
							class="toggle"
							type="checkbox"
							checked={item.completed}
							on:change={(e) => handleChangeCheckboxComplete(e, item.id)}
						/>
						<label for="item-checkbox" on:dblclick={() => handleEditItem(item.id)}>
							{item.description}
						</label>
						<button class="destroy" on:click={() => handleRemoveItem(item.id)} />
					</div>
					{#if editing === item.id}
						<input class="edit" value={item.description} on:keydown={onKeydownInputEditItem} />
					{/if}
				</li>
			{/each}
		</ul>
	</section>
	<!-- This footer should be hidden by default and shown when there are todos -->
	<footer class="footer">
		<!-- This should be `0 items left` by default -->
		<span class="todo-count"><strong>{numActive}</strong>/{items.length} item left</span>
		<!-- Remove this if you don't implement routing -->
		<ul class="filters">
			<li>
				<a class={currentFilter === 'all' ? 'selected' : ''} href="#/">All</a>
			</li>
			<li>
				<a class={currentFilter === 'active' ? 'selected' : ''} href="#/active">Active</a>
			</li>
			<li>
				<a class={currentFilter === 'completed' ? 'selected' : ''} href="#/completed">Completed</a>
			</li>
		</ul>
		<!-- Hidden if no completed items are left ↓ -->
		<button class="clear-completed" on:click={onClickClearCompleted}>Clear completed</button>
	</footer>
</section>
<footer class="info">
	<p>Double-click to edit a todo</p>
	<!-- Remove the below line ↓ -->
	<p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
	<!-- Change this out with your name and url ↓ -->
	<p>Created by <a href="http://todomvc.com">you</a></p>
	<p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>

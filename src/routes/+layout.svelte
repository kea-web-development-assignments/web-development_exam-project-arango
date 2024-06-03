<script>
	import '../app.css';
	import airbnbLogo from '$lib/images/airbnb-logo.svg'
	import airbnbLogoBig from '$lib/images/airbnb-logo-big.svg'
	import { SearchBar, ProfileMenu } from '$lib/components';
    import { page } from '$app/stores';

	export let data;

	$: if($page.status !== 200 && $page.data?.error?.message) {
		if($page.status.toString().startsWith('4')) {
			alert(`Error: ${$page.data?.error?.message}`);
		}
		else if($page.status.toString().startsWith('5')) {
			alert(`Server error: ${$page.data?.error?.message}`);
		}
	}
</script>

<body class="w-full">
	<header class="h-20 relative flex justify-between items-center bg-green-200 shadow-md p-4">
		<a class="h-full shrink-0" href="/">
			<picture class="h-full flex items-center">
				<source media="(min-width:768px)" srcset={airbnbLogoBig}>
				<img class="h-2/3" src={airbnbLogo} alt="">
			</picture>
		</a>
		{#if data.showSearchBar}
			<SearchBar />
		{/if}
		<ProfileMenu />
	</header>
	<main class="min-h-[calc(100vh-5rem)] w-full flex flex-col bg-[floralwhite]">
		<slot />
	</main>
</body>

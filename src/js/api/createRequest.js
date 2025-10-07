const createRequest = async ({ url, method = 'GET', data }) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  
  return result;
};

export default createRequest;
